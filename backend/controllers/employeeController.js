import Employee from '../models/Employee.js';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin/HR)
export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().select('-password');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if user is authorized (own profile or admin/hr)
    if (
      req.user.id !== employee._id.toString() &&
      !['admin', 'hr'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check authorization
    const isOwnProfile = req.user.id === employee._id.toString();
    const isAdminOrHR = ['admin', 'hr'].includes(req.user.role);

    if (!isOwnProfile && !isAdminOrHR) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    // Fields that employees can update
    const employeeEditableFields = [
      'phone',
      'address',
      'avatar',
      'emergencyContact',
    ];

    // If regular employee, restrict fields
    if (isOwnProfile && !isAdminOrHR) {
      const filteredData = {};
      employeeEditableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          filteredData[field] = req.body[field];
        }
      });
      req.body = filteredData;
    }

    // Update employee
    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee status
// @route   PUT /api/employees/:id/status
// @access  Private (Admin/HR)
export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee status updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};
