const { isMockMode, getMockStore, query } = require('../config/db');

// GET /api/reports/dashboard
const getDashboardMetrics = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    if (isMockMode()) {
      const mock = getMockStore();
      const activeEmployees = mock.users.filter(u => u.status === 'active');
      const totalEmployees = activeEmployees.length;

      const todayAttendance = mock.attendance.filter(a => a.date === today);
      const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const lateCount = todayAttendance.filter(a => a.status === 'late').length;
      const onLeaveCount = mock.leaveRequests.filter(l => l.status === 'approved' && l.start_date <= today && l.end_date >= today).length;

      const totalDepts = mock.departments.length;
      const totalPayrollMonthly = activeEmployees.reduce((sum, u) => sum + (parseFloat(u.salary) || 0), 0);

      const recentLeaves = mock.leaveRequests.slice(0, 5).map(l => {
        const u = mock.users.find(user => user.id === l.user_id);
        const lt = mock.leaveTypes.find(t => t.id === l.leave_type_id);
        return {
          ...l,
          employee_name: u ? `${u.first_name} ${u.last_name}` : 'Unknown',
          leave_type: lt?.name || 'Leave'
        };
      });

      const departmentBreakdown = mock.departments.map(d => ({
        id: d.id,
        name: d.department_name,
        code: d.department_code,
        count: mock.users.filter(u => u.department_id === d.id && u.status === 'active').length
      }));

      return res.json({
        success: true,
        data: {
          totalEmployees,
          presentCount,
          lateCount,
          onLeaveCount,
          absentCount: Math.max(0, totalEmployees - presentCount - onLeaveCount),
          totalDepartments: totalDepts,
          monthlyPayrollExpense: totalPayrollMonthly,
          attendanceRate: totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100,
          recentLeaves,
          departmentBreakdown,
          announcements: mock.announcements
        }
      });
    }

    // Live SQL Queries
    const [empTotal] = await query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const [attStats] = await query(`
      SELECT 
        COUNT(CASE WHEN status = 'present' OR status = 'late' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count
      FROM attendance WHERE date = ?
    `, [today]);

    const [leaveStats] = await query(`
      SELECT COUNT(*) as count 
      FROM leave_requests 
      WHERE status = 'approved' AND ? BETWEEN start_date AND end_date
    `, [today]);

    const [deptTotal] = await query('SELECT COUNT(*) as count FROM departments');
    const [payrollSum] = await query('SELECT COALESCE(SUM(salary), 0) as total FROM users WHERE status = "active"');

    const recentLeaves = await query(`
      SELECT lr.*, CONCAT(u.first_name, ' ', u.last_name) as employee_name, lt.name as leave_type
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
      ORDER BY lr.created_at DESC LIMIT 5
    `);

    const departmentBreakdown = await query(`
      SELECT d.id, d.department_name as name, d.department_code as code, COUNT(u.id) as count
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id AND u.status = 'active'
      GROUP BY d.id
    `);

    const announcements = await query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5');

    const totalEmployees = empTotal.count || 0;
    const presentCount = attStats.present_count || 0;
    const lateCount = attStats.late_count || 0;
    const onLeaveCount = leaveStats.count || 0;

    res.json({
      success: true,
      data: {
        totalEmployees,
        presentCount,
        lateCount,
        onLeaveCount,
        absentCount: Math.max(0, totalEmployees - presentCount - onLeaveCount),
        totalDepartments: deptTotal.count || 0,
        monthlyPayrollExpense: parseFloat(payrollSum.total) || 0,
        attendanceRate: totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100,
        recentLeaves,
        departmentBreakdown,
        announcements
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/attendance-summary
const getAttendanceReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    if (isMockMode()) {
      const mock = getMockStore();
      const report = mock.users.filter(u => u.status === 'active').map(u => {
        const userAtt = mock.attendance.filter(a => a.user_id === u.id);
        const present = userAtt.filter(a => a.status === 'present').length;
        const late = userAtt.filter(a => a.status === 'late').length;
        const halfDay = userAtt.filter(a => a.status === 'half_day').length;
        const dept = mock.departments.find(d => d.id === u.department_id);

        return {
          employee_id: u.employee_id,
          name: `${u.first_name} ${u.last_name}`,
          department: dept?.department_name || 'N/A',
          designation: u.designation,
          present_days: present + late,
          late_days: late,
          half_days: halfDay,
          total_hours: userAtt.reduce((sum, a) => sum + (parseFloat(a.total_hours) || 0), 0)
        };
      });

      return res.json({ success: true, month: currentMonth, year: currentYear, data: report });
    }

    const rows = await query(`
      SELECT 
        u.employee_id, 
        CONCAT(u.first_name, ' ', u.last_name) as name, 
        d.department_name as department,
        u.designation,
        COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN a.status = 'half_day' THEN 1 END) as half_days,
        COALESCE(SUM(a.total_hours), 0) as total_hours
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN attendance a ON a.user_id = u.id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
      WHERE u.status = 'active'
      GROUP BY u.id
      ORDER BY u.first_name ASC
    `, [currentMonth, currentYear]);

    res.json({ success: true, month: currentMonth, year: currentYear, data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardMetrics,
  getAttendanceReport
};
