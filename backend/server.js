const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');
const { isMockMode } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless development and deployment on Netlify
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'WorkSphere HRMS API',
    version: '1.0.0',
    databaseMode: isMockMode() ? 'In-Memory Fallback' : 'MySQL / TiDB Cloud',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (both /api and base paths for seamless Netlify Serverless Function support)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Central Error Handling Middleware
app.use(errorHandler);

// Start Server when run directly
if (process.env.NETLIFY !== 'true' && !process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 WorkSphere Backend Server running on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;

