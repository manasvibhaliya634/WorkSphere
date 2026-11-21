const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', verifyToken, authorize(['admin', 'hr', 'manager']), getAllEmployees);
router.get('/:id', verifyToken, getEmployeeById);
router.post('/', verifyToken, authorize(['admin', 'hr']), createEmployee);
router.put('/:id', verifyToken, authorize(['admin', 'hr']), updateEmployee);
router.delete('/:id', verifyToken, authorize(['admin']), deleteEmployee);

module.exports = router;
