const { isMockMode, getMockStore, query } = require('../config/db');

// GET /api/payroll/all
const getAllPayrolls = async (req, res, next) => {
  try {
    const { month, year, payment_status, department_id } = req.query;

    if (isMockMode()) {
      const mock = getMockStore();
      let list = mock.payroll.map(p => {
        const user = mock.users.find(u => u.id === p.user_id);
        const dept = mock.departments.find(d => d.id === user?.department_id);
        return {
          ...p,
          employee_id: user?.employee_id,
          first_name: user?.first_name,
          last_name: user?.last_name,
          designation: user?.designation,
          department_name: dept?.department_name || 'N/A',
          department_id: user?.department_id
        };
      });

      if (month) list = list.filter(p => p.month.toLowerCase() === month.toLowerCase());
      if (year) list = list.filter(p => String(p.year) === String(year));
      if (payment_status) list = list.filter(p => p.payment_status === payment_status);
      if (department_id) list = list.filter(p => String(p.department_id) === String(department_id));

      return res.json({ success: true, count: list.length, data: list });
    }

    let sql = `
      SELECT p.*, u.employee_id, u.first_name, u.last_name, u.designation, d.department_name, u.department_id
      FROM payroll p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (month) {
      sql += ' AND LOWER(p.month) = LOWER(?)';
      params.push(month);
    }
    if (year) {
      sql += ' AND p.year = ?';
      params.push(year);
    }
    if (payment_status) {
      sql += ' AND p.payment_status = ?';
      params.push(payment_status);
    }
    if (department_id) {
      sql += ' AND u.department_id = ?';
      params.push(department_id);
    }

    sql += ' ORDER BY p.id DESC';
    const rows = await query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/payroll/my
const getMyPayrolls = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isMockMode()) {
      const mock = getMockStore();
      const list = mock.payroll
        .filter(p => p.user_id === userId)
        .sort((a, b) => b.id - a.id);
      return res.json({ success: true, count: list.length, data: list });
    }

    const rows = await query('SELECT * FROM payroll WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/payroll/generate
const generatePayroll = async (req, res, next) => {
  try {
    const { user_id, month, year, allowances = 0, deductions = 0, payment_method = 'Bank Transfer', remarks = '' } = req.body;

    if (!user_id || !month || !year) {
      return res.status(400).json({ success: false, message: 'User ID, month, and year are required.' });
    }

    if (isMockMode()) {
      const mock = getMockStore();
      const user = mock.users.find(u => u.id === parseInt(user_id, 10));
      if (!user) return res.status(404).json({ success: false, message: 'Employee not found.' });

      const basic = parseFloat(user.salary) || 50000;
      const allow = parseFloat(allowances) || 0;
      const ded = parseFloat(deductions) || 0;
      const net = basic + allow - ded;

      const existingIndex = mock.payroll.findIndex(p => p.user_id === user.id && p.month.toLowerCase() === month.toLowerCase() && p.year === parseInt(year, 10));

      if (existingIndex >= 0) {
        mock.payroll[existingIndex] = {
          ...mock.payroll[existingIndex],
          basic_salary: basic,
          allowances: allow,
          deductions: ded,
          net_salary: net,
          remarks,
          payment_method
        };
        return res.json({ success: true, message: 'Payroll record updated.', data: mock.payroll[existingIndex] });
      }

      const newId = mock.payroll.length ? Math.max(...mock.payroll.map(p => p.id)) + 1 : 1;
      const newRecord = {
        id: newId,
        user_id: user.id,
        month,
        year: parseInt(year, 10),
        basic_salary: basic,
        allowances: allow,
        deductions: ded,
        net_salary: net,
        payment_date: null,
        payment_status: 'pending',
        payment_method,
        remarks
      };

      mock.payroll.unshift(newRecord);
      return res.status(201).json({ success: true, message: 'Payroll generated successfully.', data: newRecord });
    }

    const [user] = await query('SELECT id, salary FROM users WHERE id = ?', [user_id]);
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const basic = parseFloat(user.salary) || 50000;
    const allow = parseFloat(allowances) || 0;
    const ded = parseFloat(deductions) || 0;
    const net = basic + allow - ded;

    const result = await query(`
      INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status, payment_method, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      ON DUPLICATE KEY UPDATE 
        basic_salary = VALUES(basic_salary),
        allowances = VALUES(allowances),
        deductions = VALUES(deductions),
        net_salary = VALUES(net_salary),
        payment_method = VALUES(payment_method),
        remarks = VALUES(remarks)
    `, [user_id, month, year, basic, allow, ded, net, payment_method, remarks]);

    res.status(201).json({ success: true, message: 'Payroll generated successfully.', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// PUT /api/payroll/:id/status
const updatePayrollStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { payment_status, payment_method, remarks } = req.body;

    if (!['pending', 'processing', 'paid'].includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    }

    const paymentDate = payment_status === 'paid' ? new Date().toISOString().split('T')[0] : null;

    if (isMockMode()) {
      const mock = getMockStore();
      const p = mock.payroll.find(item => item.id === id);
      if (!p) return res.status(404).json({ success: false, message: 'Payroll record not found.' });

      p.payment_status = payment_status;
      if (paymentDate) p.payment_date = paymentDate;
      if (payment_method) p.payment_method = payment_method;
      if (remarks) p.remarks = remarks;

      return res.json({ success: true, message: `Payroll status updated to ${payment_status}.`, data: p });
    }

    await query(
      `UPDATE payroll SET 
        payment_status = ?, 
        payment_date = COALESCE(?, payment_date),
        payment_method = COALESCE(?, payment_method),
        remarks = COALESCE(?, remarks)
      WHERE id = ?`,
      [payment_status, paymentDate, payment_method, remarks, id]
    );

    res.json({ success: true, message: `Payroll status updated to ${payment_status}.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/payroll/:id/payslip
const getPayslipDetails = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isMockMode()) {
      const mock = getMockStore();
      const p = mock.payroll.find(item => item.id === id);
      if (!p) return res.status(404).json({ success: false, message: 'Payslip not found.' });

      // Check authorization (must be admin/hr or owner)
      if (req.user.role === 'employee' && req.user.id !== p.user_id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const user = mock.users.find(u => u.id === p.user_id);
      const dept = mock.departments.find(d => d.id === user?.department_id);

      return res.json({
        success: true,
        data: {
          ...p,
          employee: {
            id: user.id,
            employee_id: user.employee_id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            designation: user.designation,
            department: dept?.department_name || 'N/A',
            date_of_joining: user.date_of_joining,
            phone: user.phone
          },
          company: {
            name: 'WorkSphere Technologies Ltd.',
            tagline: 'Enterprise Workspace & Human Resource Portal',
            address: 'Tower B, Tech Horizon Business Park, Bengaluru 560103',
            tax_id: 'PAN/GST: AAACW1234F1Z5'
          }
        }
      });
    }

    const rows = await query(`
      SELECT p.*, u.employee_id, u.first_name, u.last_name, u.email, u.designation, u.date_of_joining, u.phone, d.department_name
      FROM payroll p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE p.id = ?
    `, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payslip not found.' });
    }

    const p = rows[0];
    if (req.user.role === 'employee' && req.user.id !== p.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({
      success: true,
      data: {
        id: p.id,
        user_id: p.user_id,
        month: p.month,
        year: p.year,
        basic_salary: p.basic_salary,
        allowances: p.allowances,
        deductions: p.deductions,
        net_salary: p.net_salary,
        payment_date: p.payment_date,
        payment_status: p.payment_status,
        payment_method: p.payment_method,
        remarks: p.remarks,
        employee: {
          id: p.user_id,
          employee_id: p.employee_id,
          name: `${p.first_name} ${p.last_name}`,
          email: p.email,
          designation: p.designation,
          department: p.department_name || 'N/A',
          date_of_joining: p.date_of_joining,
          phone: p.phone
        },
        company: {
          name: 'WorkSphere Technologies Ltd.',
          tagline: 'Enterprise Workspace & Human Resource Portal',
          address: 'Tower B, Tech Horizon Business Park, Bengaluru 560103',
          tax_id: 'PAN/GST: AAACW1234F1Z5'
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPayrolls,
  getMyPayrolls,
  generatePayroll,
  updatePayrollStatus,
  getPayslipDetails
};
