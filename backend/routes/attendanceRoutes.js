const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/check-in', verifyToken, checkIn);
router.post('/check-out', verifyToken, checkOut);
router.get('/today', verifyToken, getTodayStatus);
router.get('/my', verifyToken, getMyAttendance);
router.get('/all', verifyToken, authorize(['admin', 'hr', 'manager']), getAllAttendance);

module.exports = router;
