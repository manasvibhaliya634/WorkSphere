import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportAPI, attendanceAPI, leaveAPI } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  Clock,
  CalendarCheck2,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Send,
  Timer
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, attRes] = await Promise.all([
        reportAPI.getDashboardMetrics(),
        attendanceAPI.getToday()
      ]);
      if (dashRes.data?.success) setMetrics(dashRes.data.data);
      if (attRes.data?.success) setTodayAttendance(attRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    setPunching(true);
    try {
      await attendanceAPI.checkIn({ notes: 'Dashboard check-in' });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setPunching(false);
    }
  };

  const handleCheckOut = async () => {
    setPunching(true);
    try {
      await attendanceAPI.checkOut();
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setPunching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const isCheckedIn = !!todayAttendance?.check_in;
  const isCheckedOut = !!todayAttendance?.check_out;

  return (
    <div>
      {/* Employee Live Punch-In / Punch-Out Banner */}
      <div className="punch-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
            <Timer size={18} />
            <span>ATTENDANCE RECORDER</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {currentTime}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' • '}
            Status today:{' '}
            <span style={{ color: isCheckedIn ? '#34d399' : '#f87171', fontWeight: 700 }}>
              {isCheckedOut ? 'Checked Out' : isCheckedIn ? `Checked In at ${todayAttendance.check_in}` : 'Not Checked In'}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={punching}
              className="btn btn-success"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              <CheckCircle size={18} />
              {punching ? 'Recording...' : 'Punch In (Check-In)'}
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleCheckOut}
              disabled={punching}
              className="btn btn-danger"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              <Clock size={18} />
              {punching ? 'Recording...' : 'Punch Out (Check-Out)'}
            </button>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px 18px', borderRadius: 8, fontSize: '0.85rem' }}>
              ✓ Shift Completed ({todayAttendance.total_hours} hrs)
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row (for Admin / HR / Manager) */}
      {hasRole(['admin', 'hr', 'manager']) && metrics && (
        <div className="stat-grid">
          <StatCard
            title="Total Employees"
            value={metrics.totalEmployees}
            subtitle="Active workforce"
            icon={Users}
            color="#2563eb"
            bg="#eff6ff"
          />
          <StatCard
            title="Present Today"
            value={metrics.presentCount}
            subtitle={`${metrics.attendanceRate}% Attendance Rate`}
            icon={CheckCircle}
            color="#10b981"
            bg="#ecfdf5"
          />
          <StatCard
            title="On Leave Today"
            value={metrics.onLeaveCount}
            subtitle={`${metrics.absentCount} Unplanned Absences`}
            icon={CalendarCheck2}
            color="#f59e0b"
            bg="#fffbeb"
          />
          <StatCard
            title="Monthly Payroll Payout"
            value={`₹${(metrics.monthlyPayrollExpense || 0).toLocaleString('en-IN')}`}
            subtitle="Current cycle projection"
            icon={DollarSign}
            color="#8b5cf6"
            bg="#f3e8ff"
          />
        </div>
      )}

      {/* Grid: Department Distribution & Recent Leaves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 28 }}>
        
        {/* Department Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Department Headcounts
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {metrics?.departmentBreakdown?.length || 0} Departments Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {metrics?.departmentBreakdown?.map((dept) => (
              <div key={dept.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building size={16} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{dept.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Code: {dept.code}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb' }}>
                  {dept.count} Members
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Leave Applications
            </h3>
            <a href="/leaves" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              View All Leaves →
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {metrics?.recentLeaves && metrics.recentLeaves.length > 0 ? (
              metrics.recentLeaves.map((lr) => (
                <div key={lr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{lr.employee_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {lr.leave_type} • {lr.total_days} {lr.total_days === 1 ? 'day' : 'days'} ({lr.start_date})
                    </div>
                  </div>
                  <span className={`badge badge-${lr.status}`}>
                    {lr.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '20px 0', textAlign: 'center' }}>
                No recent leave requests
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Company Announcements */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          Company Announcements & Notices
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {metrics?.announcements?.map((a) => (
            <div key={a.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{a.title}</h4>
                <span className="badge badge-admin" style={{ fontSize: '0.7rem' }}>{a.category}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#475569' }}>{a.content}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
