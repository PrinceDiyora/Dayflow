import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';

// @desc    Get employee dashboard data
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get employee profile
    const employee = await Employee.findById(employeeId).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Attendance Summary
    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalWorkingDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateDays = attendanceRecords.filter(a => a.isLate).length;

    // Calculate total hours worked this month
    const totalHours = attendanceRecords.reduce((sum, record) => {
      if (record.checkOut && record.checkIn) {
        const hours = (new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Leave Summary
    const leaves = await Leave.find({ employeeId: employeeId });
    
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;
    
    // This year's leave usage
    const yearLeaves = leaves.filter(l => 
      new Date(l.startDate) >= startOfYear && l.status === 'approved'
    );
    
    const totalLeaveDays = yearLeaves.reduce((sum, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    // Recent leaves
    const recentLeaves = await Leave.find({ employeeId: employeeId })
      .sort({ appliedDate: -1 })
      .limit(5)
      .populate('approvedBy', 'name');

    // Payroll Summary
    const latestPayroll = await Payroll.findOne({ 
      employeeId: employeeId 
    }).sort({ month: -1, year: -1 });

    // Recent payroll history
    const payrollHistory = await Payroll.find({ 
      employeeId: employeeId 
    })
      .sort({ year: -1, month: -1 })
      .limit(3)
      .select('month year netSalary status');

    // Upcoming leaves
    const upcomingLeaves = await Leave.find({
      employeeId: employeeId,
      status: 'approved',
      startDate: { $gte: today },
    })
      .sort({ startDate: 1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          avatar: employee.avatar,
          joinDate: employee.joinDate,
          status: employee.status,
        },
        attendance: {
          today: todayAttendance ? {
            status: todayAttendance.status,
            checkIn: todayAttendance.checkIn,
            checkOut: todayAttendance.checkOut,
            isLate: todayAttendance.isLate,
            hoursWorked: todayAttendance.checkOut 
              ? ((new Date(todayAttendance.checkOut) - new Date(todayAttendance.checkIn)) / (1000 * 60 * 60)).toFixed(2)
              : null,
          } : null,
          thisMonth: {
            totalWorkingDays,
            presentDays,
            absentDays,
            lateDays,
            totalHours: totalHours.toFixed(2),
            attendanceRate: totalWorkingDays > 0 
              ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
              : 0,
          },
        },
        leaves: {
          balance: employee.leaveBalance,
          summary: {
            pending: pendingLeaves,
            approved: approvedLeaves,
            rejected: rejectedLeaves,
            usedThisYear: totalLeaveDays,
          },
          recent: recentLeaves.map(leave => ({
            id: leave._id,
            type: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            status: leave.status,
            reason: leave.reason,
            approvedBy: leave.approvedBy?.name,
            appliedDate: leave.appliedDate,
          })),
          upcoming: upcomingLeaves.map(leave => ({
            id: leave._id,
            type: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
          })),
        },
        payroll: {
          current: latestPayroll ? {
            month: latestPayroll.month,
            year: latestPayroll.year,
            basicSalary: latestPayroll.basicSalary,
            allowances: latestPayroll.allowances,
            deductions: latestPayroll.deductions,
            grossSalary: latestPayroll.grossSalary,
            netSalary: latestPayroll.netSalary,
            status: latestPayroll.status,
            paymentDate: latestPayroll.paymentDate,
          } : null,
          history: payrollHistory.map(p => ({
            month: p.month,
            year: p.year,
            netSalary: p.netSalary,
            status: p.status,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin/HR dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin/HR)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Employee Statistics
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });
    const suspendedEmployees = await Employee.countDocuments({ status: 'suspended' });

    // Department breakdown
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Role breakdown
    const roleStats = await Employee.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentHires = await Employee.find({
      joinDate: { $gte: thirtyDaysAgo },
    })
      .select('name employeeId department position joinDate')
      .sort({ joinDate: -1 })
      .limit(5);

    // Attendance Overview
    const todayAttendance = await Attendance.find({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    }).populate('employeeId', 'name employeeId department');

    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const absentToday = activeEmployees - presentToday;
    const lateToday = todayAttendance.filter(a => a.isLate).length;

    // Monthly attendance stats
    const monthlyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Leave Requests
    const pendingLeaves = await Leave.find({ status: 'pending' })
      .populate('employeeId', 'name employeeId department position avatar')
      .sort({ appliedDate: -1 })
      .limit(10);

    const totalPendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeavesThisMonth = await Leave.countDocuments({
      status: 'approved',
      appliedDate: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const rejectedLeavesThisMonth = await Leave.countDocuments({
      status: 'rejected',
      appliedDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Leave type breakdown
    const leaveTypeStats = await Leave.aggregate([
      {
        $match: {
          status: 'approved',
          startDate: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Payroll Overview
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const payrollStats = await Payroll.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netSalary' },
        },
      },
    ]);

    const totalPayroll = payrollStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    const processedPayroll = payrollStats.find(s => s._id === 'paid')?.count || 0;
    const pendingPayroll = payrollStats.find(s => s._id === 'pending')?.count || 0;

    // Employees on leave today
    const employeesOnLeaveToday = await Leave.find({
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .populate('employeeId', 'name employeeId department avatar')
      .select('employeeId leaveType startDate endDate');

    // Quick stats for charts
    const last7DaysAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { 
            $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          suspended: suspendedEmployees,
          byDepartment: departmentStats.map(d => ({
            department: d._id,
            count: d.count,
          })),
          byRole: roleStats.map(r => ({
            role: r._id,
            count: r.count,
          })),
          recentHires: recentHires.map(emp => ({
            id: emp._id,
            name: emp.name,
            employeeId: emp.employeeId,
            department: emp.department,
            position: emp.position,
            joinDate: emp.joinDate,
          })),
        },
        attendance: {
          today: {
            present: presentToday,
            absent: absentToday,
            late: lateToday,
            total: activeEmployees,
            attendanceRate: activeEmployees > 0 
              ? ((presentToday / activeEmployees) * 100).toFixed(1)
              : 0,
          },
          thisMonth: monthlyAttendance.map(stat => ({
            status: stat._id,
            count: stat.count,
          })),
          last7Days: last7DaysAttendance.map(stat => ({
            date: stat._id.date,
            status: stat._id.status,
            count: stat.count,
          })),
          employeesOnLeave: employeesOnLeaveToday.map(leave => ({
            id: leave.employeeId._id,
            name: leave.employeeId.name,
            employeeId: leave.employeeId.employeeId,
            department: leave.employeeId.department,
            avatar: leave.employeeId.avatar,
            leaveType: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
          })),
        },
        leaves: {
          pending: totalPendingLeaves,
          approvedThisMonth: approvedLeavesThisMonth,
          rejectedThisMonth: rejectedLeavesThisMonth,
          byType: leaveTypeStats.map(stat => ({
            type: stat._id,
            count: stat.count,
          })),
          pendingRequests: pendingLeaves.map(leave => ({
            id: leave._id,
            employee: {
              id: leave.employeeId._id,
              name: leave.employeeId.name,
              employeeId: leave.employeeId.employeeId,
              department: leave.employeeId.department,
              position: leave.employeeId.position,
              avatar: leave.employeeId.avatar,
            },
            leaveType: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            duration: Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1,
            reason: leave.reason,
            appliedDate: leave.appliedDate,
          })),
        },
        payroll: {
          currentMonth: {
            month: currentMonth,
            year: currentYear,
            totalAmount: totalPayroll,
            processed: processedPayroll,
            pending: pendingPayroll,
          },
          byStatus: payrollStats.map(stat => ({
            status: stat._id,
            count: stat.count,
            totalAmount: stat.totalAmount,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance overview for specific date range
// @route   GET /api/dashboard/attendance-overview
// @access  Private (Admin/HR)
export const getAttendanceOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: attendanceData.map(item => ({
        date: item._id.date,
        status: item._id.status,
        count: item.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave statistics
// @route   GET /api/dashboard/leave-stats
// @access  Private (Admin/HR)
export const getLeaveStats = async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31);

    const leaveStats = await Leave.aggregate([
      {
        $match: {
          startDate: { $gte: startOfYear, $lte: endOfYear },
          status: 'approved',
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$startDate' },
            type: '$leaveType',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: leaveStats.map(stat => ({
        month: stat._id.month,
        type: stat._id.type,
        count: stat.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};
