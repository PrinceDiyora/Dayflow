import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, employeeId } = req.query;

    let query = {};

    // If regular employee, only show their own leaves
    if (req.user.role === 'employee') {
      query.employeeId = req.user.id;
    } else if (employeeId) {
      query.employeeId = employeeId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name employeeId department')
      .populate('approvedBy', 'name')
      .sort({ appliedDate: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
export const getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'name employeeId')
      .populate('approvedBy', 'name');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
export const applyLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check leave balance
    const employee = await Employee.findById(req.user.id);
    const leaveBalance = employee.leaveBalance[type];

    if (leaveBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${type} leave balance`,
      });
    }

    const leave = await Leave.create({
      employeeId: req.user.id,
      type,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve leave
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin/HR)
export const approveLeave = async (req, res, next) => {
  try {
    const { comments } = req.body;

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request already processed',
      });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();
    leave.comments = comments || 'Approved';

    await leave.save();

    // Update employee leave balance
    const employee = await Employee.findById(leave.employeeId);
    employee.leaveBalance[leave.type] -= leave.days;
    employee.leaveBalance.used += leave.days;
    employee.leaveBalance.remaining -= leave.days;
    await employee.save();

    // Create notification
    await Notification.create({
      userId: leave.employeeId,
      type: 'leave_approved',
      title: 'Leave Request Approved',
      message: `Your ${leave.type} leave request has been approved`,
      link: '/leaves',
    });

    res.status(200).json({
      success: true,
      message: 'Leave approved successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject leave
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin/HR)
export const rejectLeave = async (req, res, next) => {
  try {
    const { comments } = req.body;

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request already processed',
      });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();
    leave.comments = comments || 'Rejected';

    await leave.save();

    // Create notification
    await Notification.create({
      userId: leave.employeeId,
      type: 'leave_rejected',
      title: 'Leave Request Rejected',
      message: `Your ${leave.type} leave request has been rejected`,
      link: '/leaves',
    });

    res.status(200).json({
      success: true,
      message: 'Leave rejected successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete leave
// @route   DELETE /api/leaves/:id
// @access  Private
export const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Check authorization
    if (
      req.user.id !== leave.employeeId.toString() &&
      !['admin', 'hr'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this leave request',
      });
    }

    await leave.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
