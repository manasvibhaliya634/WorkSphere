const bcrypt = require('bcryptjs');
const { isMockMode, getMockStore, query } = require('../config/db');

// GET /api/employees
const getAllEmployees = async (req, res, next) => {
  try {
    const { department_id, role, status, search } = req.query;

    if (isMockMode()) {
      const mock = getMockStore();
      let list = mock.users.map(u => {
        const dept = mock.departments.find(d => d.id === u.department_id);
        const safe = { ...u, department_name: dept?.department_name || 'Unassigned' };
        delete safe.password_hash;
        return safe;
      });

      if (department_id) list = list.filter(u => String(u.department_id) === String(department_id));
      if (role) list = list.filter(u => u.role === role);
      if (status) list = list.filter(u => u.status === status);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(u =>
          u.first_name.toLowerCase().includes(s) ||
          u.last_name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.employee_id.toLowerCase().includes(s) ||
          u.designation.toLowerCase().includes(s)
        );
      }

      return res.json({ success: true, count: list.length, data: list });
    }

    let sql = `
      SELECT u.id, u.employee_id, u.first_name, u.last_name, u.email, u.role, 
             u.department_id, u.designation, u.phone, u.address, u.date_of_joining, 
             u.salary, u.status, u.avatar_url, u.created_at, d.department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      sql += ' AND u.department_id = ?';
      params.push(department_id);
    }
    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ? OR u.designation LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    sql += ' ORDER BY u.id ASC';
    const rows = await query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isMockMode()) {
      const mock = getMockStore();
      const user = mock.users.find(u => u.id === id);
      if (!user) return res.status(404).json({ success: false, message: 'Employee not found.' });
      const dept = mock.departments.find(d => d.id === user.department_id);
      const safe = { ...user, department_name: dept?.department_name || 'Unassigned' };
      delete safe.password_hash;
      return res.json({ success: true, data: safe });
    }

    const rows = await query(
      `SELECT u.id, u.employee_id, u.first_name, u.last_name, u.email, u.role, 
              u.department_id, u.designation, u.phone, u.address, u.date_of_joining, 
              u.salary, u.status, u.avatar_url, u.created_at, d.department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/employees
const createEmployee = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role = 'employee',
      department_id,
      designation,
      phone,
      address,
      date_of_joining,
      salary = 0.00,
      avatar_url
    } = req.body;

    if (!first_name || !last_name || !email || !designation || !date_of_joining) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, designation, and joining date are required.'
      });
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const empCode = role === 'admin' ? 'ADM' : role === 'hr' ? 'HR' : role === 'manager' ? 'MGR' : 'EMP';
    const employee_id = `WS-${empCode}-${randomSuffix}`;

    if (isMockMode()) {
      const mock = getMockStore();
      if (mock.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
      }

      const newId = mock.users.length ? Math.max(...mock.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        employee_id,
        first_name,
        last_name,
        email,
        password_hash: passwordHash,
        role,
        department_id: department_id ? parseInt(department_id, 10) : null,
        designation,
        phone: phone || '',
        address: address || '',
        date_of_joining,
        salary: parseFloat(salary) || 0,
        status: 'active',
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        created_at: new Date()
      };

      mock.users.push(newUser);
      const safe = { ...newUser };
      delete safe.password_hash;
      return res.status(201).json({ success: true, message: 'Employee added successfully.', data: safe });
    }

    const result = await query(
      `INSERT INTO users (employee_id, first_name, last_name, email, password_hash, role, department_id, designation, phone, address, date_of_joining, salary, status, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [employee_id, first_name, last_name, email, passwordHash, role, department_id || null, designation, phone || null, address || null, date_of_joining, salary, avatar_url || null]
    );

    res.status(201).json({
      success: true,
      message: 'Employee added successfully.',
      data: { id: result.insertId, employee_id, first_name, last_name, email, role, designation }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email or Employee ID already registered.' });
    }
    next(err);
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      first_name,
      last_name,
      email,
      role,
      department_id,
      designation,
      phone,
      address,
      date_of_joining,
      salary,
      status,
      avatar_url
    } = req.body;

    if (isMockMode()) {
      const mock = getMockStore();
      const userIndex = mock.users.findIndex(u => u.id === id);
      if (userIndex === -1) return res.status(404).json({ success: false, message: 'Employee not found.' });

      mock.users[userIndex] = {
        ...mock.users[userIndex],
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(department_id !== undefined && { department_id: department_id ? parseInt(department_id, 10) : null }),
        ...(designation && { designation }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(date_of_joining && { date_of_joining }),
        ...(salary !== undefined && { salary: parseFloat(salary) }),
        ...(status && { status }),
        ...(avatar_url && { avatar_url })
      };

      const safe = { ...mock.users[userIndex] };
      delete safe.password_hash;
      return res.json({ success: true, message: 'Employee updated successfully.', data: safe });
    }

    await query(
      `UPDATE users SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department_id = COALESCE(?, department_id),
        designation = COALESCE(?, designation),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        date_of_joining = COALESCE(?, date_of_joining),
        salary = COALESCE(?, salary),
        status = COALESCE(?, status),
        avatar_url = COALESCE(?, avatar_url)
      WHERE id = ?`,
      [first_name, last_name, email, role, department_id, designation, phone, address, date_of_joining, salary, status, avatar_url, id]
    );

    res.json({ success: true, message: 'Employee updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Prevent deleting self
    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    if (isMockMode()) {
      const mock = getMockStore();
      const user = mock.users.find(u => u.id === id);
      if (!user) return res.status(404).json({ success: false, message: 'Employee not found.' });

      user.status = 'inactive';
      return res.json({ success: true, message: 'Employee deactivated successfully.' });
    }

    await query('UPDATE users SET status = "inactive" WHERE id = ?', [id]);
    res.json({ success: true, message: 'Employee deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
