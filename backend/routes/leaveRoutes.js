const express = require('express');
const router = express.Router();
const {
  getLeaveTypes,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/types', verifyToken, getLeaveTypes);
router.post('/', verifyToken, applyLeave);
router.get('/my', verifyToken, getMyLeaves);
router.get('/all', verifyToken, authorize(['admin', 'hr', 'manager']), getAllLeaves);
router.put('/:id/status', verifyToken, authorize(['admin', 'hr', 'manager']), updateLeaveStatus);

module.exports = router;
