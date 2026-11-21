// WorkSphere In-Memory Demo Store
// Provides instant zero-setup demonstration data when MySQL is not yet configured or started

const bcrypt = require('bcryptjs');

let users = [
  {
    id: 1,
    employee_id: 'WS-ADM-001',
    first_name: 'Vikramaditya',
    last_name: 'Rao',
    email: 'admin@worksphere.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    department_id: 1,
    designation: 'Chief Executive Officer & Admin',
    phone: '+91 98765 43210',
    address: '101 Cyber Towers, Tech City',
    date_of_joining: '2022-01-15',
    salary: 185000.00,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    created_at: new Date('2022-01-15')
  },
  {
    id: 2,
    employee_id: 'WS-HR-002',
    first_name: 'Pooja',
    last_name: 'Sharma',
    email: 'hr@worksphere.com',
    password_hash: bcrypt.hashSync('hr123', 10),
    role: 'hr',
    department_id: 2,
    designation: 'Senior HR Lead & Talent Partner',
    phone: '+91 98234 56789',
    address: '404 Green Valley, Sector 62',
    date_of_joining: '2022-03-01',
    salary: 95000.00,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    created_at: new Date('2022-03-01')
  },
  {
    id: 3,
    employee_id: 'WS-MGR-003',
    first_name: 'Arjun',
    last_name: 'Verma',
    email: 'manager@worksphere.com',
    password_hash: bcrypt.hashSync('manager123', 10),
    role: 'manager',
    department_id: 3,
    designation: 'Engineering Director & Team Manager',
    phone: '+91 97112 34567',
    address: '702 Silicon Enclave, Electronic City',
    date_of_joining: '2022-05-10',
    salary: 140000.00,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    created_at: new Date('2022-05-10')
  },
  {
    id: 4,
    employee_id: 'WS-EMP-004',
    first_name: 'Rahul',
    last_name: 'Patel',
    email: 'employee@worksphere.com',
    password_hash: bcrypt.hashSync('employee123', 10),
    role: 'employee',
    department_id: 3,
    designation: 'Full Stack Software Engineer',
    phone: '+91 96543 21098',
    address: 'B-12 Lotus Apartments, Indiranagar',
    date_of_joining: '2023-02-15',
    salary: 72000.00,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    created_at: new Date('2023-02-15')
  },
  {
    id: 5,
    employee_id: 'WS-EMP-005',
    first_name: 'Ananya',
    last_name: 'Iyer',
    email: 'ananya.iyer@worksphere.com',
    password_hash: bcrypt.hashSync('employee123', 10),
    role: 'employee',
    department_id: 4,
    designation: 'Marketing & Brand Specialist',
    phone: '+91 98450 12345',
    address: 'A-304 Palm Grove, Whitefield',
    date_of_joining: '2023-06-01',
    salary: 65000.00,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    created_at: new Date('2023-06-01')
  },
  {
    id: 6,
    employee_id: 'WS-EMP-006',
    first_name: 'Karan',
    last_name: 'Mehta',
    email: 'karan.mehta@worksphere.com',
    password_hash: bcrypt.hashSync('employee123', 10),
    role: 'employee',
    department_id: 5,
    designation: 'Financial Analyst',
    phone: '+91 97654 32109',
    address: '12 Lake View Residency, HSR Layout',
    date_of_joining: '2023-08-15',
    salary: 68000.00,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    created_at: new Date('2023-08-15')
  }
];

let departments = [
  { id: 1, department_name: 'Executive Management', department_code: 'EXEC', description: 'Corporate governance, strategy and leadership', manager_name: 'Vikramaditya Rao' },
  { id: 2, department_name: 'Human Resources', department_code: 'HR', description: 'Talent acquisition, employee relations, compliance and payroll', manager_name: 'Pooja Sharma' },
  { id: 3, department_name: 'Engineering & Tech', department_code: 'ENG', description: 'Product design, software architecture, and cloud infrastructure', manager_name: 'Arjun Verma' },
  { id: 4, department_name: 'Marketing & Sales', department_code: 'MKT', description: 'Client acquisition, digital marketing and business growth', manager_name: 'Neha Gupta' },
  { id: 5, department_name: 'Finance & Accounts', department_code: 'FIN', description: 'Auditing, taxation, financial planning and risk management', manager_name: 'Rajesh Patel' }
];

let leaveTypes = [
  { id: 1, name: 'Casual Leave', max_days: 12, description: 'Short term personal leave' },
  { id: 2, name: 'Sick Leave', max_days: 10, description: 'Leave taken due to illness or medical care' },
  { id: 3, name: 'Earned / Privilege Leave', max_days: 15, description: 'Annual paid leaves accrued over the year' },
  { id: 4, name: 'Maternity / Paternity Leave', max_days: 90, description: 'Parental support leave' },
  { id: 5, name: 'Compensatory Off', max_days: 5, description: 'Off granted for working on holidays or weekends' }
];

const todayStr = new Date().toISOString().split('T')[0];

let attendance = [
  { id: 1, user_id: 1, date: todayStr, check_in: '09:00:00', check_out: null, total_hours: 0.00, status: 'present', notes: 'CEO Office Morning Sync' },
  { id: 2, user_id: 2, date: todayStr, check_in: '09:15:00', check_out: null, total_hours: 0.00, status: 'present', notes: 'HR Onboarding sessions' },
  { id: 3, user_id: 3, date: todayStr, check_in: '08:55:00', check_out: null, total_hours: 0.00, status: 'present', notes: 'Tech standup conducted' },
  { id: 4, user_id: 4, date: todayStr, check_in: '09:05:00', check_out: null, total_hours: 0.00, status: 'present', notes: 'Checked in on time' },
  { id: 5, user_id: 5, date: todayStr, check_in: null, check_out: null, total_hours: 0.00, status: 'absent', notes: 'Medical leave' },
  { id: 6, user_id: 6, date: todayStr, check_in: '10:05:00', check_out: null, total_hours: 0.00, status: 'late', notes: 'Commute delay' }
];

let leaveRequests = [
  {
    id: 1,
    user_id: 4,
    leave_type_id: 1,
    start_date: '2026-11-25',
    end_date: '2026-11-26',
    total_days: 2,
    reason: 'Family wedding ceremony out of town',
    status: 'approved',
    approved_by: 3,
    action_notes: 'Approved. Please hand over pending tasks before leaving.',
    created_at: new Date('2026-11-18')
  },
  {
    id: 2,
    user_id: 5,
    leave_type_id: 2,
    start_date: todayStr,
    end_date: todayStr,
    total_days: 1,
    reason: 'Severe seasonal viral fever and doctor consultation',
    status: 'approved',
    approved_by: 2,
    action_notes: 'Take rest. Get well soon.',
    created_at: new Date(todayStr)
  },
  {
    id: 3,
    user_id: 6,
    leave_type_id: 3,
    start_date: '2026-12-05',
    end_date: '2026-12-09',
    total_days: 5,
    reason: 'Annual family holiday trip',
    status: 'pending',
    approved_by: null,
    action_notes: null,
    created_at: new Date('2026-11-20')
  }
];

let payroll = [
  {
    id: 1,
    user_id: 1,
    month: 'October',
    year: 2026,
    basic_salary: 150000.00,
    allowances: 35000.00,
    deductions: 0.00,
    net_salary: 185000.00,
    payment_date: '2026-10-31',
    payment_status: 'paid',
    payment_method: 'Direct Deposit',
    remarks: 'Monthly executive payout completed'
  },
  {
    id: 2,
    user_id: 2,
    month: 'October',
    year: 2026,
    basic_salary: 75000.00,
    allowances: 20000.00,
    deductions: 0.00,
    net_salary: 95000.00,
    payment_date: '2026-10-31',
    payment_status: 'paid',
    payment_method: 'Direct Deposit',
    remarks: 'Monthly salary processed'
  },
  {
    id: 3,
    user_id: 3,
    month: 'October',
    year: 2026,
    basic_salary: 115000.00,
    allowances: 25000.00,
    deductions: 0.00,
    net_salary: 140000.00,
    payment_date: '2026-10-31',
    payment_status: 'paid',
    payment_method: 'Direct Deposit',
    remarks: 'Engineering management salary processed'
  },
  {
    id: 4,
    user_id: 4,
    month: 'October',
    year: 2026,
    basic_salary: 60000.00,
    allowances: 12000.00,
    deductions: 0.00,
    net_salary: 72000.00,
    payment_date: '2026-10-31',
    payment_status: 'paid',
    payment_method: 'Direct Deposit',
    remarks: 'Performance bonus included'
  },
  {
    id: 5,
    user_id: 5,
    month: 'October',
    year: 2026,
    basic_salary: 52000.00,
    allowances: 13000.00,
    deductions: 0.00,
    net_salary: 65000.00,
    payment_date: '2026-10-31',
    payment_status: 'paid',
    payment_method: 'Direct Deposit',
    remarks: 'Monthly salary processed'
  },
  {
    id: 6,
    user_id: 6,
    month: 'October',
    year: 2026,
    basic_salary: 55000.00,
    allowances: 13000.00,
    deductions: 0.00,
    net_salary: 68000.00,
    payment_date: '2026-10-31',
    payment_status: 'paid',
    payment_method: 'Direct Deposit',
    remarks: 'Monthly salary processed'
  },
  {
    id: 7,
    user_id: 4,
    month: 'November',
    year: 2026,
    basic_salary: 60000.00,
    allowances: 12000.00,
    deductions: 0.00,
    net_salary: 72000.00,
    payment_date: null,
    payment_status: 'pending',
    payment_method: 'Direct Deposit',
    remarks: 'Scheduled for 30th November'
  }
];

let announcements = [
  {
    id: 1,
    title: 'Welcome to WorkSphere HRMS Portal',
    content: 'We are delighted to introduce WorkSphere, your centralized workspace for attendance tracking, leave applications, payroll payslips and department updates.',
    category: 'general',
    posted_by: 1,
    created_at: new Date('2026-11-01')
  },
  {
    id: 2,
    title: 'Upcoming Company Town Hall & Annual Awards',
    content: 'Join all leadership members next Friday at 4:00 PM IST for quarterly highlights and employee recognition awards.',
    category: 'event',
    posted_by: 2,
    created_at: new Date('2026-11-15')
  }
];

module.exports = {
  users,
  departments,
  leaveTypes,
  attendance,
  leaveRequests,
  payroll,
  announcements
};
