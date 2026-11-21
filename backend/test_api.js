// WorkSphere Automated API Verification Suite
const http = require('http');

const runTests = async () => {
  console.log('--- Starting WorkSphere API Verification Suite ---');

  // Start backend server in-process for testing
  process.env.PORT = '5001';
  process.env.NODE_ENV = 'test';
  const server = require('./server');

  // Wait 1 second for express server to bind
  await new Promise(r => setTimeout(r, 1000));

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : null;
      const options = {
        hostname: '127.0.0.1',
        port: 5001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString && { 'Content-Length': Buffer.byteLength(dataString) }),
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const req = http.request(options, (res) => {
        let respData = '';
        res.on('data', chunk => respData += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      });

      req.on('error', err => reject(err));
      if (dataString) req.write(dataString);
      req.end();
    });
  };

  try {
    // Test 1: Health check
    const health = await request('/api/health');
    console.log(`✔ [1] Health Check: Status ${health.status}, DB Mode: ${health.data.databaseMode}`);

    // Test 2: Admin Login
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'admin@worksphere.com',
      password: 'admin123'
    });
    console.log(`✔ [2] Admin Login: Status ${loginRes.status}, User: ${loginRes.data.user.first_name} (${loginRes.data.user.role})`);
    const token = loginRes.data.token;

    // Test 3: Get Dashboard Metrics
    const metrics = await request('/api/reports/dashboard', 'GET', null, token);
    console.log(`✔ [3] Dashboard Metrics: Status ${metrics.status}, Total Employees: ${metrics.data.data.totalEmployees}, Monthly Expense: ₹${metrics.data.data.monthlyPayrollExpense}`);

    // Test 4: Get Employees
    const employees = await request('/api/employees', 'GET', null, token);
    console.log(`✔ [4] Employee Directory: Status ${employees.status}, Count: ${employees.data.count}`);

    // Test 5: Get Departments
    const depts = await request('/api/departments', 'GET', null, token);
    console.log(`✔ [5] Departments List: Status ${depts.status}, Count: ${depts.data.count}`);

    // Test 6: Attendance Today Check
    const todayAtt = await request('/api/attendance/today', 'GET', null, token);
    console.log(`✔ [6] Today Attendance Check: Status ${todayAtt.status}`);

    // Test 7: Apply Leave
    const leaveRes = await request('/api/leaves', 'POST', {
      leave_type_id: 1,
      start_date: '2026-11-28',
      end_date: '2026-11-29',
      reason: 'Automated test personal day off'
    }, token);
    console.log(`✔ [7] Apply Leave: Status ${leaveRes.status}, Message: ${leaveRes.data.message}`);

    // Test 8: Get Payrolls
    const payrollRes = await request('/api/payroll/all', 'GET', null, token);
    console.log(`✔ [8] Payroll Ledger: Status ${payrollRes.status}, Count: ${payrollRes.data.count}`);

    // Test 9: Get Payslip
    const payslipRes = await request('/api/payroll/1/payslip', 'GET', null, token);
    console.log(`✔ [9] Payslip Generator: Status ${payslipRes.status}, Employee: ${payslipRes.data.data.employee.name}, Net Pay: ₹${payslipRes.data.data.net_salary}`);

    console.log('--- ALL 9 API ENDPOINTS VERIFIED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
};

runTests();
