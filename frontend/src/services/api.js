import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('worksphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('worksphere_token');
        localStorage.removeItem('worksphere_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Employee Endpoints
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`)
};

// Department Endpoints
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

// Attendance Endpoints
export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: () => api.post('/attendance/check-out'),
  getToday: () => api.get('/attendance/today'),
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
  getAllAttendance: (params) => api.get('/attendance/all', { params })
};

// Leave Endpoints
export const leaveAPI = {
  getTypes: () => api.get('/leaves/types'),
  apply: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/my'),
  getAllLeaves: (params) => api.get('/leaves/all', { params }),
  updateStatus: (id, data) => api.put(`/leaves/${id}/status`, data)
};

// Payroll Endpoints
export const payrollAPI = {
  getAll: (params) => api.get('/payroll/all', { params }),
  getMyPayrolls: () => api.get('/payroll/my'),
  generate: (data) => api.post('/payroll/generate', data),
  updateStatus: (id, data) => api.put(`/payroll/${id}/status`, data),
  getPayslip: (id) => api.get(`/payroll/${id}/payslip`)
};

// Report Endpoints
export const reportAPI = {
  getDashboardMetrics: () => api.get('/reports/dashboard'),
  getAttendanceReport: (params) => api.get('/reports/attendance-summary', { params })
};

export default api;
