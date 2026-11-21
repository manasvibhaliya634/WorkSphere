const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', verifyToken, getAllDepartments);
router.post('/', verifyToken, authorize(['admin', 'hr']), createDepartment);
router.put('/:id', verifyToken, authorize(['admin', 'hr']), updateDepartment);
router.delete('/:id', verifyToken, authorize(['admin']), deleteDepartment);

module.exports = router;
