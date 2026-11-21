import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, CheckCircle2 } from 'lucide-react';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
          {pageTitle}
        </h1>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Welcome back, {user?.first_name}! Here is what's happening today.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* System Online Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: 9999, border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={13} color="#10b981" />
          <span>System Live</span>
        </div>

        {/* User Role Badge */}
        <span className={`badge badge-${user?.role}`}>
          {user?.role?.toUpperCase()}
        </span>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="Avatar"
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {user?.designation || user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 8 }}
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
