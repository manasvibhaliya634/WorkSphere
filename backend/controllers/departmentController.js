const { isMockMode, getMockStore, query } = require('../config/db');

// GET /api/departments
const getAllDepartments = async (req, res, next) => {
  try {
    if (isMockMode()) {
      const mock = getMockStore();
      const list = mock.departments.map(d => {
        const count = mock.users.filter(u => u.department_id === d.id && u.status === 'active').length;
        return { ...d, employee_count: count };
      });
      return res.json({ success: true, count: list.length, data: list });
    }

    const rows = await query(`
      SELECT d.*, COUNT(u.id) AS employee_count
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id AND u.status = 'active'
      GROUP BY d.id
      ORDER BY d.department_name ASC
    `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/departments
const createDepartment = async (req, res, next) => {
  try {
    const { department_name, department_code, description, manager_name } = req.body;

    if (!department_name || !department_code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    if (isMockMode()) {
      const mock = getMockStore();
      if (mock.departments.some(d => d.department_name.toLowerCase() === department_name.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Department with this name already exists.' });
      }

      const newId = mock.departments.length ? Math.max(...mock.departments.map(d => d.id)) + 1 : 1;
      const newDept = {
        id: newId,
        department_name,
        department_code: department_code.toUpperCase(),
        description: description || '',
        manager_name: manager_name || ''
      };

      mock.departments.push(newDept);
      return res.status(201).json({ success: true, message: 'Department created.', data: newDept });
    }

    const result = await query(
      'INSERT INTO departments (department_name, department_code, description, manager_name) VALUES (?, ?, ?, ?)',
      [department_name, department_code.toUpperCase(), description || null, manager_name || null]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: { id: result.insertId, department_name, department_code }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Department name or code already exists.' });
    }
    next(err);
  }
};

// PUT /api/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { department_name, department_code, description, manager_name } = req.body;

    if (isMockMode()) {
      const mock = getMockStore();
      const index = mock.departments.findIndex(d => d.id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Department not found.' });

      mock.departments[index] = {
        ...mock.departments[index],
        ...(department_name && { department_name }),
        ...(department_code && { department_code: department_code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(manager_name !== undefined && { manager_name })
      };

      return res.json({ success: true, message: 'Department updated.', data: mock.departments[index] });
    }

    await query(
      `UPDATE departments SET 
        department_name = COALESCE(?, department_name),
        department_code = COALESCE(?, department_code),
        description = COALESCE(?, description),
        manager_name = COALESCE(?, manager_name)
       WHERE id = ?`,
      [department_name, department_code, description, manager_name, id]
    );

    res.json({ success: true, message: 'Department updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/departments/:id
const deleteDepartment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isMockMode()) {
      const mock = getMockStore();
      const hasEmployees = mock.users.some(u => u.department_id === id && u.status === 'active');
      if (hasEmployees) {
        return res.status(400).json({ success: false, message: 'Cannot delete department with active employees.' });
      }

      mock.departments = mock.departments.filter(d => d.id !== id);
      return res.json({ success: true, message: 'Department deleted successfully.' });
    }

    const [empCheck] = await query('SELECT COUNT(*) as count FROM users WHERE department_id = ? AND status = "active"', [id]);
    if (empCheck && empCheck.count > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete department with active employees.' });
    }

    await query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
