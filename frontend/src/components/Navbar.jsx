import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, CheckCircle2 } from 'lucide-react';

const Navbar = ({ pageTitle = 'Dashboard', onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mobile-toggle-btn"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
            {pageTitle}
          </h1>
          <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Welcome back, {user?.first_name}!
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* System Online Badge (Hidden on small mobile) */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: 9999, border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={13} color="#10b981" />
          <span>Live</span>
        </div>

        {/* User Role Badge */}
        <span className={`badge badge-${user?.role}`}>
          {user?.role?.toUpperCase()}
        </span>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid #e2e8f0', paddingLeft: 12 }}>
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="Avatar"
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div className="hide-on-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {user?.first_name} {user?.last_name}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 8px' }}
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
