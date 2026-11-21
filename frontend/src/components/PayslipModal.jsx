import React from 'react';
import { Printer, Download, Building, ShieldCheck, X } from 'lucide-react';

const PayslipModal = ({ isOpen, onClose, payslipData }) => {
  if (!isOpen || !payslipData) return null;

  const handlePrint = () => {
    window.print();
  };

  const { employee, company, month, year, basic_salary, allowances, deductions, net_salary, payment_date, payment_status, payment_method } = payslipData;

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg printable-payslip"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 750 }}
      >
        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} /> Print Payslip
            </button>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Payslip Document Body */}
        <div style={{ padding: '36px' }}>
          {/* Company Branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 20, marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <ShieldCheck size={18} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{company?.name || 'WorkSphere Technologies Ltd.'}</h2>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{company?.tagline || 'Enterprise Human Resource & Workforce Portal'}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{company?.address || 'Tower B, Tech Horizon Business Park, Bengaluru 560103'}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{company?.tax_id || 'GST/PAN: AAACW1234F1Z5'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge badge-${payment_status}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                PAYSLIP: {payment_status?.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 8 }}>
                {month} {year}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Pay Date: {payment_date || 'Pending Processing'}
              </p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Employee Name:</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{employee?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Employee Code:</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{employee?.employee_id}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Designation:</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{employee?.designation}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Department:</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{employee?.department}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Payment Mode:</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{payment_method || 'Bank Transfer'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Joining Date:</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{employee?.date_of_joining}</div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Earnings */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                EARNINGS
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <span>Basic Salary</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(basic_salary)}</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <span>Allowances & Bonus</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(allowances)}</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', background: '#ecfdf5', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>Gross Earnings</span>
                <span>{formatCurrency(Number(basic_salary) + Number(allowances))}</span>
              </div>
            </div>

            {/* Deductions */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                DEDUCTIONS
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <span>Provident Fund (PF)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(deductions)}</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <span>Professional Tax</span>
                <span style={{ fontWeight: 600 }}>₹0.00</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', background: '#fef2f2', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>Total Deductions</span>
                <span>{formatCurrency(deductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight */}
          <div style={{ background: '#1e293b', color: '#ffffff', padding: '20px 24px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Net Payable Amount
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Disbursed to registered bank account
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatCurrency(net_salary)}
            </div>
          </div>

          {/* Footer Signature */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <div>
              <p>Generated by WorkSphere HRMS System.</p>
              <p>This is a computer-generated document and requires no physical signature.</p>
            </div>
            <div style={{ textAlign: 'center', borderTop: '1px solid #94a3b8', paddingTop: 8, width: 180 }}>
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
