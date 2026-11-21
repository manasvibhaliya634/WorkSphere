import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { departmentAPI } from '../services/api';
import Modal from '../components/Modal';
import { Building2, Plus, Edit2, Trash2, Users } from 'lucide-react';

const Departments = () => {
  const { hasRole } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    department_code: '',
    description: '',
    manager_name: ''
  });

  const loadDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      if (res.data?.success) setDepartments(res.data.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      department_name: '',
      department_code: '',
      description: '',
      manager_name: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      department_name: dept.department_name,
      department_code: dept.department_code,
      description: dept.description || '',
      manager_name: dept.manager_name || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentAPI.update(editingDept.id, formData);
        alert('Department updated successfully.');
      } else {
        await departmentAPI.create(formData);
        alert('Department created successfully.');
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentAPI.delete(id);
        alert('Department deleted.');
        loadDepartments();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Departments & Divisions ({departments.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Organize teams, assign divisional managers and manage resource allocation.
          </p>
        </div>

        {hasRole(['admin', 'hr']) && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Create Department
          </button>
        )}
      </div>

      {/* Grid of Department Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {departments.map((dept) => (
          <div key={dept.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {dept.department_name}
                  </h3>
                  <span className="badge badge-employee" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginTop: 4 }}>
                    CODE: {dept.department_code}
                  </span>
                </div>
                <div style={{ width: 40, height: 40, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Building2 size={20} />
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 16, minHeight: 40 }}>
                {dept.description || 'Core business division and operational unit.'}
              </p>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', marginBottom: 2 }}>Department Lead:</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{dept.manager_name || 'Designation Pending'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
                <Users size={16} />
                <span>{dept.employee_count || 0} Members</span>
              </div>

              {hasRole(['admin', 'hr']) && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleOpenEdit(dept)} className="btn btn-secondary btn-sm" title="Edit Department">
                    <Edit2 size={13} />
                  </button>
                  {hasRole('admin') && (
                    <button onClick={() => handleDelete(dept.id)} className="btn btn-danger btn-sm" title="Delete Department">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.department_name}` : 'Create New Department'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Engineering & Technology"
              value={formData.department_name}
              onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Department Code *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. ENG"
                value={formData.department_code}
                onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department Lead / Manager Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Arjun Verma"
                value={formData.manager_name}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe department responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
