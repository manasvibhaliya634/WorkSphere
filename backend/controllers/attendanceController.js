const { isMockMode, getMockStore, query } = require('../config/db');

const getTodayDateStr = () => new Date().toISOString().split('T')[0];
const getCurrentTimeStr = () => new Date().toTimeString().split(' ')[0];

// POST /api/attendance/check-in
const checkIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateStr();
    const timeNow = getCurrentTimeStr();

    // Standard business start: 09:30 AM is threshold for 'late'
    const status = timeNow > '09:30:00' ? 'late' : 'present';

    if (isMockMode()) {
      const mock = getMockStore();
      const existing = mock.attendance.find(a => a.user_id === userId && a.date === today);

      if (existing && existing.check_in) {
        return res.status(400).json({ success: false, message: 'You have already checked in today.' });
      }

      if (existing) {
        existing.check_in = timeNow;
        existing.status = status;
        return res.json({ success: true, message: `Checked in at ${timeNow}`, data: existing });
      }

      const newId = mock.attendance.length ? Math.max(...mock.attendance.map(a => a.id)) + 1 : 1;
      const newRecord = {
        id: newId,
        user_id: userId,
        date: today,
        check_in: timeNow,
        check_out: null,
        total_hours: 0,
        status,
        notes: req.body.notes || 'Web portal check-in'
      };

      mock.attendance.push(newRecord);
      return res.json({ success: true, message: `Checked in successfully at ${timeNow}`, data: newRecord });
    }

    const [existing] = await query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
    if (existing && existing.check_in) {
      return res.status(400).json({ success: false, message: 'You have already checked in today.' });
    }

    if (existing) {
      await query('UPDATE attendance SET check_in = ?, status = ? WHERE id = ?', [timeNow, status, existing.id]);
    } else {
      await query(
        'INSERT INTO attendance (user_id, date, check_in, status, notes) VALUES (?, ?, ?, ?, ?)',
        [userId, today, timeNow, status, req.body.notes || 'Web portal check-in']
      );
    }

    res.json({ success: true, message: `Checked in successfully at ${timeNow}`, time: timeNow, status });
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance/check-out
const checkOut = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateStr();
    const timeNow = getCurrentTimeStr();

    if (isMockMode()) {
      const mock = getMockStore();
      const record = mock.attendance.find(a => a.user_id === userId && a.date === today);

      if (!record || !record.check_in) {
        return res.status(400).json({ success: false, message: 'No check-in record found for today.' });
      }
      if (record.check_out) {
        return res.status(400).json({ success: false, message: 'You have already checked out today.' });
      }

      record.check_out = timeNow;
      // Calculate work hours
      const [inH, inM] = record.check_in.split(':').map(Number);
      const [outH, outM] = timeNow.split(':').map(Number);
      const diffHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
      record.total_hours = Math.max(0, parseFloat(diffHours.toFixed(2)));

      return res.json({ success: true, message: `Checked out successfully at ${timeNow}`, data: record });
    }

    const [record] = await query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
    if (!record || !record.check_in) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today.' });
    }
    if (record.check_out) {
      return res.status(400).json({ success: false, message: 'You have already checked out today.' });
    }

    const [inH, inM] = record.check_in.split(':').map(Number);
    const [outH, outM] = timeNow.split(':').map(Number);
    const diffHours = Math.max(0, parseFloat((((outH * 60 + outM) - (inH * 60 + inM)) / 60).toFixed(2)));

    await query('UPDATE attendance SET check_out = ?, total_hours = ? WHERE id = ?', [timeNow, diffHours, record.id]);

    res.json({ success: true, message: `Checked out successfully at ${timeNow}`, total_hours: diffHours });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateStr();

    if (isMockMode()) {
      const mock = getMockStore();
      const record = mock.attendance.find(a => a.user_id === userId && a.date === today) || null;
      return res.json({ success: true, data: record });
    }

    const [record] = await query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
    res.json({ success: true, data: record || null });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/my
const getMyAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (isMockMode()) {
      const mock = getMockStore();
      let list = mock.attendance.filter(a => a.user_id === userId);
      if (month && year) {
        const paddedMonth = String(month).padStart(2, '0');
        const prefix = `${year}-${paddedMonth}`;
        list = list.filter(a => a.date.startsWith(prefix));
      }
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.json({ success: true, count: list.length, data: list });
    }

    let sql = 'SELECT * FROM attendance WHERE user_id = ?';
    const params = [userId];

    if (month && year) {
      sql += ' AND MONTH(date) = ? AND YEAR(date) = ?';
      params.push(month, year);
    }

    sql += ' ORDER BY date DESC';
    const rows = await query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/all
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department_id, status } = req.query;
    const targetDate = date || getTodayDateStr();

    if (isMockMode()) {
      const mock = getMockStore();
      let list = mock.attendance.filter(a => a.date === targetDate);

      const enriched = list.map(a => {
        const user = mock.users.find(u => u.id === a.user_id);
        const dept = mock.departments.find(d => d.id === user?.department_id);
        return {
          ...a,
          employee_id: user?.employee_id,
          first_name: user?.first_name,
          last_name: user?.last_name,
          department_name: dept?.department_name || 'N/A',
          designation: user?.designation,
          department_id: user?.department_id
        };
      });

      let filtered = enriched;
      if (department_id) filtered = filtered.filter(a => String(a.department_id) === String(department_id));
      if (status) filtered = filtered.filter(a => a.status === status);

      return res.json({ success: true, count: filtered.length, date: targetDate, data: filtered });
    }

    let sql = `
      SELECT a.*, u.employee_id, u.first_name, u.last_name, u.designation, d.department_name, u.department_id
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE a.date = ?
    `;
    const params = [targetDate];

    if (department_id) {
      sql += ' AND u.department_id = ?';
      params.push(department_id);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY u.first_name ASC';
    const rows = await query(sql, params);
    res.json({ success: true, count: rows.length, date: targetDate, data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance
};
