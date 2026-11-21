import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  PieChart
} from 'lucide-react';

const Reports = () => {
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [attRes, dashRes] = await Promise.all([
        reportAPI.getAttendanceReport(),
        reportAPI.getDashboardMetrics()
      ]);
      if (attRes.data?.success) setAttendanceReport(attRes.data.data);
      if (dashRes.data?.success) setMetrics(dashRes.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportAttendanceCSV = () => {
    if (!attendanceReport.length) return;
    const headers = ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Present Days', 'Late Days', 'Total Work Hours'];
    const rows = attendanceReport.map(r => [
      `"${r.employee_id}"`,
      `"${r.name}"`,
      `"${r.department}"`,
      `"${r.designation}"`,
      r.present_days,
      r.late_days,
      r.total_hours
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WorkSphere_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDepartmentCSV = () => {
    if (!metrics?.departmentBreakdown?.length) return;
    const headers = ['Department Code', 'Department Name', 'Active Headcount'];
    const rows = metrics.departmentBreakdown.map(d => [
      `"${d.code}"`,
      `"${d.name}"`,
      d.count
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WorkSphere_Departments_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Analytics & Management Reports
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Consolidated workforce reports, monthly attendance ratios, department distribution and data export.
          </p>
        </div>

        <button onClick={exportAttendanceCSV} className="btn btn-primary">
          <Download size={16} /> Export Attendance CSV
        </button>
      </div>

      {/* Analytics Summary Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MONTHLY ATTENDANCE RATIO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {metrics?.attendanceRate || 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
            ✓ Consistent enterprise operational compliance
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ACTIVE WORKFORCE POOL</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {metrics?.totalEmployees || 0} Employees
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Distributed across {metrics?.totalDepartments || 0} business divisions
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ANNUALIZED PAYROLL VOLUME</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            ₹{((metrics?.monthlyPayrollExpense || 0) * 12).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Based on active salary schedule
          </div>
        </div>
      </div>

      {/* Monthly Attendance Summary Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Monthly Attendance Aggregation by Staff Member
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Current Month Cycle
          </span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Staff Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Present Days</th>
                <th>Late Days</th>
                <th>Total Recorded Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceReport.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>
                    {row.employee_id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>{row.department}</td>
                  <td>{row.designation}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>
                    {row.present_days} days
                  </td>
                  <td style={{ fontWeight: 600, color: '#d97706' }}>
                    {row.late_days} days
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {Number(row.total_hours).toFixed(2)} hrs
                  </td>
                </tr>
              ))}
              {attendanceReport.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No report data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Distribution Report */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Divisional Headcount Distribution
          </h3>
          <button onClick={exportDepartmentCSV} className="btn btn-secondary btn-sm">
            <Download size={13} /> Export Division CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Division Code</th>
                <th>Department Name</th>
                <th>Active Personnel</th>
                <th>Headcount Share</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.departmentBreakdown?.map((dept) => {
                const percentage = metrics.totalEmployees > 0
                  ? Math.round((dept.count / metrics.totalEmployees) * 100)
                  : 0;

                return (
                  <tr key={dept.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{dept.code}</td>
                    <td style={{ fontWeight: 600 }}>{dept.name}</td>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{dept.count} Members</td>
                    <td style={{ width: 250 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: '#2563eb', borderRadius: 9999 }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, width: 40 }}>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
