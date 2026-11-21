const { isMockMode, getMockStore, query } = require('../config/db');

// GET /api/leaves/types
const getLeaveTypes = async (req, res, next) => {
  try {
    if (isMockMode()) {
      return res.json({ success: true, data: getMockStore().leaveTypes });
    }
    const rows = await query('SELECT * FROM leave_types ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/leaves
const applyLeave = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { leave_type_id, start_date, end_date, reason } = req.body;

    if (!leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.'
      });
    }

    // Calculate days count
    const d1 = new Date(start_date);
    const d2 = new Date(end_date);
    if (d2 < d1) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.'
      });
    }

    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;

    if (isMockMode()) {
      const mock = getMockStore();
      const newId = mock.leaveRequests.length ? Math.max(...mock.leaveRequests.map(l => l.id)) + 1 : 1;
      const newLeave = {
        id: newId,
        user_id: userId,
        leave_type_id: parseInt(leave_type_id, 10),
        start_date,
        end_date,
        total_days: diffDays,
        reason,
        status: 'pending',
        approved_by: null,
        action_notes: null,
        created_at: new Date()
      };

      mock.leaveRequests.unshift(newLeave);
      return res.status(201).json({ success: true, message: 'Leave request submitted successfully.', data: newLeave });
    }

    const result = await query(
      `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, leave_type_id, start_date, end_date, diffDays, reason]
    );

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      data: { id: result.insertId, total_days: diffDays }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/leaves/my
const getMyLeaves = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isMockMode()) {
      const mock = getMockStore();
      const list = mock.leaveRequests
        .filter(l => l.user_id === userId)
        .map(l => {
          const type = mock.leaveTypes.find(t => t.id === l.leave_type_id);
          const approver = mock.users.find(u => u.id === l.approved_by);
          return {
            ...l,
            leave_type_name: type?.name || 'General',
            approver_name: approver ? `${approver.first_name} ${approver.last_name}` : null
          };
        });
      return res.json({ success: true, count: list.length, data: list });
    }

    const rows = await query(`
      SELECT lr.*, lt.name as leave_type_name, CONCAT(u2.first_name, ' ', u2.last_name) as approver_name
      FROM leave_requests lr
      LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u2 ON lr.approved_by = u2.id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [userId]);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/leaves/all
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, department_id } = req.query;

    if (isMockMode()) {
      const mock = getMockStore();
      let list = mock.leaveRequests.map(l => {
        const user = mock.users.find(u => u.id === l.user_id);
        const type = mock.leaveTypes.find(t => t.id === l.leave_type_id);
        const dept = mock.departments.find(d => d.id === user?.department_id);
        const approver = mock.users.find(u => u.id === l.approved_by);
        return {
          ...l,
          employee_id: user?.employee_id,
          first_name: user?.first_name,
          last_name: user?.last_name,
          designation: user?.designation,
          department_name: dept?.department_name || 'N/A',
          department_id: user?.department_id,
          leave_type_name: type?.name || 'General',
          approver_name: approver ? `${approver.first_name} ${approver.last_name}` : null
        };
      });

      if (status) list = list.filter(l => l.status === status);
      if (department_id) list = list.filter(l => String(l.department_id) === String(department_id));

      return res.json({ success: true, count: list.length, data: list });
    }

    let sql = `
      SELECT lr.*, u.employee_id, u.first_name, u.last_name, u.designation, d.department_name, lt.name as leave_type_name,
             CONCAT(u2.first_name, ' ', u2.last_name) as approver_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u2 ON lr.approved_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND lr.status = ?';
      params.push(status);
    }
    if (department_id) {
      sql += ' AND u.department_id = ?';
      params.push(department_id);
    }

    sql += ' ORDER BY lr.created_at DESC';
    const rows = await query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// PUT /api/leaves/:id/status
const updateLeaveStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, action_notes } = req.body;
    const reviewerId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    if (isMockMode()) {
      const mock = getMockStore();
      const leave = mock.leaveRequests.find(l => l.id === id);
      if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });

      leave.status = status;
      leave.approved_by = reviewerId;
      leave.action_notes = action_notes || '';
      return res.json({ success: true, message: `Leave request ${status} successfully.`, data: leave });
    }

    await query(
      'UPDATE leave_requests SET status = ?, approved_by = ?, action_notes = ? WHERE id = ?',
      [status, reviewerId, action_notes || null, id]
    );

    res.json({ success: true, message: `Leave request ${status} successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeaveTypes,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
