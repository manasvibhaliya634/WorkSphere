import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Building2,
  Receipt,
  BarChart3,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true
    },
    {
      to: '/employees',
      label: 'Employees',
      icon: Users,
      show: hasRole(['admin', 'hr', 'manager'])
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: Clock,
      show: true
    },
    {
      to: '/leaves',
      label: 'Leave Management',
      icon: CalendarDays,
      show: true
    },
    {
      to: '/departments',
      label: 'Departments',
      icon: Building2,
      show: true
    },
    {
      to: '/payroll',
      label: hasRole(['admin', 'hr']) ? 'Payroll & Salaries' : 'My Payslips',
      icon: Receipt,
      show: true
    },
    {
      to: '/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      show: hasRole(['admin', 'hr', 'manager'])
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <ShieldCheck size={20} />
        </div>
        <div>
          <span style={{ letterSpacing: '-0.02em' }}>WorkSphere</span>
          <span style={{ fontSize: '0.65rem', display: 'block', color: '#60a5fa', fontWeight: 500 }}>
            HRMS ENTERPRISE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Management</div>
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-quick-card">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="Profile"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.first_name} {user?.last_name}
            </div>
            <span className={`badge badge-${user?.role}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
