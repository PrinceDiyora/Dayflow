import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
export const getAllAttendance = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    let query = {};

    // If regular employee, only show their own attendance
    if (req.user.role === 'employee') {
      query.employeeId = req.user.id;
    } else if (employeeId) {
      // Admin/HR can filter by employeeId
      query.employeeId = employeeId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name employeeId department')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate(
      'employeeId',
      'name employeeId'
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
export const checkIn = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId: req.user.id,
      date: today,
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    let attendance;

    if (existingAttendance) {
      existingAttendance.checkIn = checkInTime;
      existingAttendance.status = 'present';
      attendance = await existingAttendance.save();
    } else {
      attendance = await Attendance.create({
        employeeId: req.user.id,
        date: today,
        checkIn: checkInTime,
        status: 'present',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private
export const checkOut = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: req.user.id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today',
      });
    }

    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    attendance.checkOut = checkOutTime;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create attendance record (Admin/HR)
// @route   POST /api/attendance
// @access  Private (Admin/HR)
export const createAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, remarks } = req.body;

    const attendance = await Attendance.create({
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin/HR)
export const updateAttendance = async (req, res, next) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin/HR)
export const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
