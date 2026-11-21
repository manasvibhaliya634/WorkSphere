import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { payrollAPI, employeeAPI } from '../services/api';
import Modal from '../components/Modal';
import PayslipModal from '../components/PayslipModal';
import {
  Receipt,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  FileText
} from 'lucide-react';

const Payroll = () => {
  const { user, hasRole } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    month: 'November',
    year: '2026',
    allowances: '12000',
    deductions: '0',
    payment_method: 'Direct Deposit',
    remarks: 'Monthly salary disbursement'
  });

  const loadData = async () => {
    try {
      if (hasRole(['admin', 'hr'])) {
        const [payRes, empRes] = await Promise.all([
          payrollAPI.getAll(),
          employeeAPI.getAll()
        ]);
        if (payRes.data?.success) setPayrolls(payRes.data.data);
        if (empRes.data?.success) setEmployees(empRes.data.data);
      } else {
        const payRes = await payrollAPI.getMyPayrolls();
        if (payRes.data?.success) setPayrolls(payRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenGenerate = () => {
    setFormData({
      user_id: employees[0]?.id || '',
      month: 'November',
      year: '2026',
      allowances: '12000',
      deductions: '0',
      payment_method: 'Direct Deposit',
      remarks: 'Monthly salary disbursement'
    });
    setIsGenerateModalOpen(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await payrollAPI.generate(formData);
      alert('Payroll record created / updated successfully.');
      setIsGenerateModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payroll.');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await payrollAPI.updateStatus(id, {
        payment_status: 'paid',
        payment_method: 'Bank Transfer',
        remarks: 'Direct bank payout completed'
      });
      alert('Payroll marked as PAID.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleViewPayslip = async (id) => {
    try {
      const res = await payrollAPI.getPayslip(id);
      if (res.data?.success) {
        setSelectedPayslip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not fetch payslip.');
    }
  };

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {hasRole(['admin', 'hr']) ? 'Payroll & Payout Ledger' : 'My Salary & Payslips'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Review monthly salary slips, deductions, bank disbursements and compliance records.
          </p>
        </div>

        {hasRole(['admin', 'hr']) && (
          <button onClick={handleOpenGenerate} className="btn btn-primary">
            <Plus size={16} /> Process / Generate Payroll
          </button>
        )}
      </div>

      {/* Payroll Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {hasRole(['admin', 'hr']) && <th>Employee</th>}
                <th>Period</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Payable</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p.id}>
                  {hasRole(['admin', 'hr']) && (
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.employee_id} • {p.department_name}</div>
                    </td>
                  )}
                  <td style={{ fontWeight: 600 }}>
                    {p.month} {p.year}
                  </td>
                  <td>{formatCurrency(p.basic_salary)}</td>
                  <td style={{ color: '#16a34a' }}>+{formatCurrency(p.allowances)}</td>
                  <td style={{ color: '#dc2626' }}>-{formatCurrency(p.deductions)}</td>
                  <td style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {formatCurrency(p.net_salary)}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{p.payment_date || 'Pending'}</td>
                  <td>
                    <span className={`badge badge-${p.payment_status}`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      {hasRole(['admin', 'hr']) && p.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          className="btn btn-success btn-sm"
                          title="Mark as Paid"
                        >
                          <CheckCircle size={13} /> Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleViewPayslip(p.id)}
                        className="btn btn-secondary btn-sm"
                        title="View & Print Payslip"
                      >
                        <FileText size={13} /> Payslip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No payroll records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Salary Payout"
      >
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Select Employee *</label>
            <select
              className="form-select"
              required
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id}) — Base: ₹{Number(emp.salary || 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Month *</label>
              <select
                className="form-select"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Allowances & Bonus (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deductions / PF (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Disbursement Method</label>
            <select
              className="form-select"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="Direct Deposit">Direct Deposit (Bank Transfer)</option>
              <option value="NEFT / RTGS">NEFT / RTGS</option>
              <option value="Cheque">Company Cheque</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Payslip Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Payslip Modal */}
      <PayslipModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        payslipData={selectedPayslip}
      />
    </div>
  );
};

export default Payroll;
