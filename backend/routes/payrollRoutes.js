const express = require('express');
const router = express.Router();
const {
  getAllPayrolls,
  getMyPayrolls,
  generatePayroll,
  updatePayrollStatus,
  getPayslipDetails
} = require('../controllers/payrollController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/all', verifyToken, authorize(['admin', 'hr']), getAllPayrolls);
router.get('/my', verifyToken, getMyPayrolls);
router.post('/generate', verifyToken, authorize(['admin', 'hr']), generatePayroll);
router.put('/:id/status', verifyToken, authorize(['admin', 'hr']), updatePayrollStatus);
router.get('/:id/payslip', verifyToken, getPayslipDetails);

module.exports = router;
