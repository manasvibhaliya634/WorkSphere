import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ProtectedRoute = ({ allowedRoles = [], pageTitle = 'WorkSphere' }) => {
  const { user, loading, hasRole, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#2563eb', fontWeight: 600 }}>
        Loading WorkSphere...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-wrapper">
          <Navbar pageTitle="Access Restricted" />
          <div className="page-content">
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>
                Access Denied
              </h2>
              <p style={{ color: '#64748b', maxWidth: 450, margin: '0 auto 20px' }}>
                You do not have permission to view this module. This section is restricted to {allowedRoles.join(', ')} roles.
              </p>
              <a href="/dashboard" className="btn btn-primary">
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar pageTitle={pageTitle} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
