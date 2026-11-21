import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('worksphere_token');
      const storedUser = localStorage.getItem('worksphere_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user data from server in background
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('worksphere_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification notice:', err.message);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { token, user: loggedUser } = res.data;
      localStorage.setItem('worksphere_token', token);
      localStorage.setItem('worksphere_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const logout = () => {
    localStorage.removeItem('worksphere_token');
    localStorage.removeItem('worksphere_user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (roles = []) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, hasRole, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
