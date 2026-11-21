import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const setDemoRole = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: 20 }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#ffffff', borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
        
        {/* Brand Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', padding: '28px 24px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'rgba(255, 255, 255, 0.15)', borderRadius: 12, marginBottom: 12 }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            WorkSphere HRMS
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#bfdbfe', marginTop: 4 }}>
            Enterprise Workforce & People Operations Platform
          </p>
        </div>

        {/* Login Form Container */}
        <div style={{ padding: '28px 24px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: '0.8125rem', marginBottom: 18 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Company Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="name@worksphere.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: 8 }}
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Buttons */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>Instant Demo Quick-Fill</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <button
                type="button"
                onClick={() => setDemoRole('admin@worksphere.com', 'admin123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                👑 <strong>Admin</strong>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('hr@worksphere.com', 'hr123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                💼 <strong>HR Lead</strong>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('manager@worksphere.com', 'manager123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                👔 <strong>Manager</strong>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('employee@worksphere.com', 'employee123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                💻 <strong>Employee</strong>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
