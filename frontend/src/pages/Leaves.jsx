import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../services/api';
import Modal from '../components/Modal';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

const Leaves = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState(hasRole(['admin', 'hr', 'manager']) ? 'all' : 'my');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: 1,
    start_date: '',
    end_date: '',
    reason: ''
  });

  const loadData = async () => {
    try {
      const [typesRes, myRes] = await Promise.all([
        leaveAPI.getTypes(),
        leaveAPI.getMyLeaves()
      ]);
      if (typesRes.data?.success) setLeaveTypes(typesRes.data.data);
      if (myRes.data?.success) setMyLeaves(myRes.data.data);

      if (hasRole(['admin', 'hr', 'manager'])) {
        const allRes = await leaveAPI.getAllLeaves();
        if (allRes.data?.success) setAllLeaves(allRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.apply(formData);
      alert('Leave request submitted successfully.');
      setIsApplyModalOpen(false);
      setFormData({ leave_type_id: 1, start_date: '', end_date: '', reason: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave.');
    }
  };

  const handleStatusChange = async (id, status) => {
    const action_notes = window.prompt(`Provide optional feedback/notes for ${status}:`, '');
    try {
      await leaveAPI.updateStatus(id, { status, action_notes });
      alert(`Leave request ${status} successfully.`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Leave Management & Entitlements
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Submit personal time-off requests, track balance quotas, and manage manager approvals.
          </p>
        </div>

        <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {leaveTypes.map((t) => (
          <div key={t.id} className="card" style={{ padding: 16, background: '#ffffff' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              {t.name}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
              {t.max_days} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>days/yr</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
              {t.description}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
        {hasRole(['admin', 'hr', 'manager']) && (
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'all' ? 700 : 500,
              color: activeTab === 'all' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'all' ? '2px solid #2563eb' : 'none',
              cursor: 'pointer'
            }}
          >
            📋 All Company Requests ({allLeaves.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('my')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'my' ? 700 : 500,
            color: activeTab === 'my' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'my' ? '2px solid #2563eb' : 'none',
            cursor: 'pointer'
          }}
        >
          👤 My Leave Applications ({myLeaves.length})
        </button>
      </div>

      {/* All Company Requests Table (for Admin / HR / Manager) */}
      {activeTab === 'all' && hasRole(['admin', 'hr', 'manager']) && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{l.first_name} {l.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.designation} • {l.department_name}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{l.leave_type_name}</span>
                    </td>
                    <td>
                      {l.start_date} to {l.end_date}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {l.total_days} {l.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td style={{ maxWidth: 220, fontSize: '0.8rem', color: '#475569' }}>
                      {l.reason}
                    </td>
                    <td>
                      <span className={`badge badge-${l.status}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.status === 'pending' ? (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleStatusChange(l.id, 'approved')}
                            className="btn btn-success btn-sm"
                            title="Approve Leave"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(l.id, 'rejected')}
                            className="btn btn-danger btn-sm"
                            title="Reject Leave"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Reviewed by {l.approver_name || 'Management'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {allLeaves.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* My Leave Applications View */}
      {activeTab === 'my' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Feedback</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.leave_type_name}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td style={{ fontWeight: 700 }}>{l.total_days}</td>
                    <td style={{ maxWidth: 250, fontSize: '0.8rem', color: '#475569' }}>{l.reason}</td>
                    <td>
                      <span className={`badge badge-${l.status}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {l.action_notes || (l.status === 'pending' ? 'Awaiting manager review' : 'No comments')}
                    </td>
                  </tr>
                ))}
                {myLeaves.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      You have not submitted any leave applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave / Time-Off"
      >
        <form onSubmit={handleApply}>
          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select
              className="form-select"
              required
              value={formData.leave_type_id}
              onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
            >
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Max {t.max_days} days)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Absence *</label>
            <textarea
              className="form-textarea"
              rows={3}
              required
              placeholder="Please provide details about your leave..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
