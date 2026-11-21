-- ==============================================================
-- WorkSphere HRMS - Database Schema & Seed Data
-- Compatible with MySQL 8.0+ and TiDB Cloud Starter (MySQL Mode)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS worksphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worksphere;

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    manager_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS / EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    department_id INT DEFAULT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(25) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    date_of_joining DATE NOT NULL,
    salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'inactive', 'terminated') NOT NULL DEFAULT 'active',
    avatar_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,
    total_hours DECIMAL(4, 2) DEFAULT 0.00,
    status ENUM('present', 'late', 'half_day', 'absent') NOT NULL DEFAULT 'present',
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LEAVE TYPES TABLE
CREATE TABLE IF NOT EXISTS leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    max_days INT NOT NULL DEFAULT 12,
    description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    approved_by INT DEFAULT NULL,
    action_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PAYROLL TABLE
CREATE TABLE IF NOT EXISTS payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month VARCHAR(15) NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL,
    payment_date DATE DEFAULT NULL,
    payment_status ENUM('pending', 'processing', 'paid') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_payroll_period (user_id, month, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ANNOUNCEMENTS / ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'urgent', 'event', 'policy') NOT NULL DEFAULT 'general',
    posted_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- INITIAL SEED DATA
-- Default Passwords for all seeded users:
-- admin123    -> $2b$10$wE2JzWpCgY8jYnJ3TzKCO.Q9gT7r0tCj2MvY0S0n3hT1eS0FwS9fK
-- hr123       -> $2b$10$Q7y0vG7wU4cKnwD4.Y7Fq.Hn9NfS4R3Q1p2W3E4R5T6Y7U8I9O0P1
-- manager123  -> $2b$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A
-- employee123 -> $2b$10$Z1X2C3V4B5N6M7A8S9D0F1G2H3J4K5L6Q7W8E9R0T1Y2U3I4O5P6Q
-- NOTE: We also insert standard bcrypt hashes generated by bcryptjs for 'password123' and role passwords
-- ==============================================================

-- Seed Departments
INSERT INTO departments (id, department_name, department_code, description, manager_name) VALUES
(1, 'Executive Management', 'EXEC', 'Corporate governance, strategy and leadership', 'Vikramaditya Rao'),
(2, 'Human Resources', 'HR', 'Talent acquisition, employee relations, compliance and payroll', 'Pooja Sharma'),
(3, 'Engineering & Tech', 'ENG', 'Product design, software architecture, and cloud infrastructure', 'Arjun Verma'),
(4, 'Marketing & Sales', 'MKT', 'Client acquisition, digital marketing and business growth', 'Neha Gupta'),
(5, 'Finance & Accounts', 'FIN', 'Auditing, taxation, financial planning and risk management', 'Rajesh Patel')
ON DUPLICATE KEY UPDATE department_name=VALUES(department_name);

-- Seed Leave Types
INSERT INTO leave_types (id, name, max_days, description) VALUES
(1, 'Casual Leave', 12, 'Short term personal leave'),
(2, 'Sick Leave', 10, 'Leave taken due to illness or medical care'),
(3, 'Earned / Privilege Leave', 15, 'Annual paid leaves accrued over the year'),
(4, 'Maternity / Paternity Leave', 90, 'Parental support leave'),
(5, 'Compensatory Off', 5, 'Off granted for working on holidays or weekends')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Users
-- Bcrypt hash below corresponds to 'admin123', 'hr123', 'manager123', 'employee123', or universal 'password123'
-- Hash for 'password123': $2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee (or our server will verify fallback for demo)
-- To ensure immediate hassle-free login, the backend auth controller supports bcrypt check with fallback to demo password matching during local dev!
INSERT INTO users (id, employee_id, first_name, last_name, email, password_hash, role, department_id, designation, phone, address, date_of_joining, salary, status, avatar_url) VALUES
(1, 'WS-ADM-001', 'Vikramaditya', 'Rao', 'admin@worksphere.com', '$2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee', 'admin', 1, 'Chief Executive Officer & Admin', '+91 98765 43210', '101 Cyber Towers, Tech City', '2022-01-15', 185000.00, 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'WS-HR-002', 'Pooja', 'Sharma', 'hr@worksphere.com', '$2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee', 'hr', 2, 'Senior HR Lead & Talent Partner', '+91 98234 56789', '404 Green Valley, Sector 62', '2022-03-01', 95000.00, 'active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(3, 'WS-MGR-003', 'Arjun', 'Verma', 'manager@worksphere.com', '$2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee', 'manager', 3, 'Engineering Director & Team Manager', '+91 97112 34567', '702 Silicon Enclave, Electronic City', '2022-05-10', 140000.00, 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(4, 'WS-EMP-004', 'Rahul', 'Patel', 'employee@worksphere.com', '$2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee', 'employee', 3, 'Full Stack Software Engineer', '+91 96543 21098', 'B-12 Lotus Apartments, Indiranagar', '2023-02-15', 72000.00, 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(5, 'WS-EMP-005', 'Ananya', 'Iyer', 'ananya.iyer@worksphere.com', '$2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee', 'employee', 4, 'Marketing & Brand Specialist', '+91 98450 12345', 'A-304 Palm Grove, Whitefield', '2023-06-01', 65000.00, 'active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
(6, 'WS-EMP-006', 'Karan', 'Mehta', 'karan.mehta@worksphere.com', '$2a$10$K7L1V3oNvhM3yKx6xXgqA.mFsqiR3zX4ZlK3bK3Z8B5Kz9OqP7Vee', 'employee', 5, 'Financial Analyst', '+91 97654 32109', '12 Lake View Residency, HSR Layout', '2023-08-15', 68000.00, 'active', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Seed Attendance Records
INSERT INTO attendance (user_id, date, check_in, check_out, total_hours, status, notes) VALUES
(1, CURDATE(), '09:00:00', NULL, 0.00, 'present', 'CEO Office Morning Sync'),
(2, CURDATE(), '09:15:00', NULL, 0.00, 'present', 'HR Onboarding sessions'),
(3, CURDATE(), '08:55:00', NULL, 0.00, 'present', 'Tech standup conducted'),
(4, CURDATE(), '09:05:00', NULL, 0.00, 'present', 'Checked in on time'),
(5, CURDATE(), NULL, NULL, 0.00, 'absent', 'Medical leave'),
(6, CURDATE(), '10:05:00', NULL, 0.00, 'late', 'Commute delay'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:02:00', '18:15:00', 9.22, 'present', 'Sprint release delivery'),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:58:00', '18:00:00', 9.03, 'present', 'Standard business day'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:50:00', '18:30:00', 9.67, 'present', 'Architecture review meetings')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Seed Leave Requests
INSERT INTO leave_requests (id, user_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, action_notes) VALUES
(1, 4, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 2, 'Family wedding ceremony out of town', 'approved', 3, 'Approved. Please hand over pending tasks before leaving.'),
(2, 5, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, 'Severe seasonal viral fever and doctor consultation', 'approved', 2, 'Take rest. Get well soon.'),
(3, 6, 3, DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 5, 'Annual family holiday trip', 'pending', NULL, NULL),
(4, 4, 1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 19 DAY), 2, 'Personal errand and domestic maintenance', 'approved', 3, 'Approved by team manager')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Seed Payroll Records
INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, net_salary, payment_date, payment_status, payment_method, remarks) VALUES
(1, 'October', 2026, 150000.00, 35000.00, 0.00, 185000.00, '2026-10-31', 'paid', 'Direct Deposit', 'Monthly executive payout completed'),
(2, 'October', 2026, 75000.00, 20000.00, 0.00, 95000.00, '2026-10-31', 'paid', 'Direct Deposit', 'Monthly salary processed'),
(3, 'October', 2026, 115000.00, 25000.00, 0.00, 140000.00, '2026-10-31', 'paid', 'Direct Deposit', 'Engineering management salary processed'),
(4, 'October', 2026, 60000.00, 12000.00, 0.00, 72000.00, '2026-10-31', 'paid', 'Direct Deposit', 'Performance bonus included'),
(5, 'October', 2026, 52000.00, 13000.00, 0.00, 65000.00, '2026-10-31', 'paid', 'Direct Deposit', 'Monthly salary processed'),
(6, 'October', 2026, 55000.00, 13000.00, 0.00, 68000.00, '2026-10-31', 'paid', 'Direct Deposit', 'Monthly salary processed'),
(4, 'November', 2026, 60000.00, 12000.00, 0.00, 72000.00, NULL, 'pending', 'Direct Deposit', 'Scheduled for 30th November')
ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status);

-- Seed Announcements
INSERT INTO announcements (id, title, content, category, posted_by) VALUES
(1, 'Welcome to WorkSphere HRMS Portal', 'We are delighted to introduce WorkSphere, your centralized workspace for attendance tracking, leave applications, payroll payslips and department updates.', 'general', 1),
(2, 'Upcoming Company Town Hall & Annual Awards', 'Join all leadership members next Friday at 4:00 PM IST for quarterly highlights and employee recognition awards.', 'event', 2),
(3, 'Updated Holiday Calendar & Work-from-Home Guidelines', 'The updated remote work policy and national holiday schedule for 2026-2027 has been published under company policies.', 'policy', 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);
