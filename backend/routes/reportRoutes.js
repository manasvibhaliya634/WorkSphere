const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getAttendanceReport
} = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/dashboard', verifyToken, getDashboardMetrics);
router.get('/attendance-summary', verifyToken, authorize(['admin', 'hr', 'manager']), getAttendanceReport);

module.exports = router;
