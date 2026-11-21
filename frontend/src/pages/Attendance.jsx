import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, departmentAPI } from '../services/api';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

const Attendance = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState(hasRole(['admin', 'hr', 'manager']) ? 'company' : 'personal');
  const [companyAttendance, setCompanyAttendance] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [todayRes, myRes, deptRes] = await Promise.all([
        attendanceAPI.getToday(),
        attendanceAPI.getMyAttendance(),
        departmentAPI.getAll()
      ]);

      if (todayRes.data?.success) setTodayRecord(todayRes.data.data);
      if (myRes.data?.success) setMyAttendance(myRes.data.data);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);

      if (hasRole(['admin', 'hr', 'manager'])) {
        const compRes = await attendanceAPI.getAllAttendance({ date: selectedDate });
        if (compRes.data?.success) setCompanyAttendance(compRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handlePunchIn = async () => {
    try {
      await attendanceAPI.checkIn({ notes: 'Portal Attendance Log' });
      alert('Checked in successfully!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handlePunchOut = async () => {
    try {
      await attendanceAPI.checkOut();
      alert('Checked out successfully!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  const filteredCompanyAttendance = companyAttendance.filter(item => {
    const matchesDept = selectedDept ? String(item.department_id) === String(selectedDept) : true;
    const matchesStatus = selectedStatus ? item.status === selectedStatus : true;
    return matchesDept && matchesStatus;
  });

  return (
    <div>
      {/* Attendance Punch Box */}
      <div className="card" style={{ marginBottom: 24, padding: 24, background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
              <Clock size={18} />
              <span>DAILY CHECK-IN / CHECK-OUT</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 4 }}>
              Today's Work Log: {new Date().toDateString()}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
              Check-In: <strong>{todayRecord?.check_in || 'Pending'}</strong> | Check-Out: <strong>{todayRecord?.check_out || 'Pending'}</strong> | Total Hours: <strong>{todayRecord?.total_hours || '0.00'} hrs</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {!todayRecord?.check_in ? (
              <button onClick={handlePunchIn} className="btn btn-success">
                <CheckCircle size={16} /> Check In Now
              </button>
            ) : !todayRecord?.check_out ? (
              <button onClick={handlePunchOut} className="btn btn-danger">
                <Clock size={16} /> Check Out Now
              </button>
            ) : (
              <span className="badge badge-present" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                ✓ Completed for today ({todayRecord.total_hours} hrs)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switch */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
        {hasRole(['admin', 'hr', 'manager']) && (
          <button
            onClick={() => setActiveTab('company')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'company' ? 700 : 500,
              color: activeTab === 'company' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'company' ? '2px solid #2563eb' : 'none',
              cursor: 'pointer'
            }}
          >
            🏢 Today's Company Attendance
          </button>
        )}
        <button
          onClick={() => setActiveTab('personal')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'personal' ? 700 : 500,
            color: activeTab === 'personal' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'personal' ? '2px solid #2563eb' : 'none',
            cursor: 'pointer'
          }}
        >
          👤 My Attendance History
        </button>
      </div>

      {/* Company Attendance View */}
      {activeTab === 'company' && hasRole(['admin', 'hr', 'manager']) && (
        <div>
          {/* Filters */}
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 170 }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div style={{ width: 200 }}>
                <select
                  className="form-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ width: 160 }}>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanyAttendance.map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 600 }}>
                        {rec.first_name} {rec.last_name}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        {rec.employee_id}
                      </td>
                      <td>{rec.department_name}</td>
                      <td>{rec.check_in || '—'}</td>
                      <td>{rec.check_out || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{rec.total_hours} hrs</td>
                      <td>
                        <span className={`badge badge-${rec.status}`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredCompanyAttendance.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No attendance records found for {selectedDate}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Personal Attendance History View */}
      {activeTab === 'personal' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In Time</th>
                  <th>Check Out Time</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600 }}>{rec.date}</td>
                    <td>{rec.check_in || '—'}</td>
                    <td>{rec.check_out || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{rec.total_hours} hrs</td>
                    <td>
                      <span className={`badge badge-${rec.status}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{rec.notes || '—'}</td>
                  </tr>
                ))}
                {myAttendance.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No attendance history recorded yet. Punch in above to start!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
