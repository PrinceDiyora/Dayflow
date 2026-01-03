import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private
export const getAllPayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;

    let query = {};

    // If regular employee, only show their own payroll
    if (req.user.role === 'employee') {
      query.employeeId = req.user.id;
    } else if (employeeId) {
      query.employeeId = employeeId;
    }

    // Filter by month and year
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const payroll = await Payroll.find(query)
      .populate('employeeId', 'name employeeId department')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payroll.length,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private
export const getPayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      'employeeId',
      'name employeeId'
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    // Check authorization
    if (
      req.user.role === 'employee' &&
      req.user.id !== payroll.employeeId._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payroll',
      });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create payroll record
// @route   POST /api/payroll
// @access  Private (Admin/HR)
export const createPayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;

    // Get employee details
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({ employeeId, month });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this month',
      });
    }

    // Create payroll with employee's salary structure
    const payroll = await Payroll.create({
      employeeId,
      month,
      year: year || new Date().getFullYear(),
      baseSalary: employee.salaryStructure.baseSalary,
      allowances: employee.salaryStructure.allowances,
      deductions: employee.salaryStructure.deductions,
    });

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private (Admin/HR)
export const updatePayroll = async (req, res, next) => {
  try {
    let payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payroll (mark as paid)
// @route   PUT /api/payroll/:id/process
// @access  Private (Admin)
export const processPayroll = async (req, res, next) => {
  try {
    let payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    if (payroll.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payroll already processed',
      });
    }

    payroll.status = 'paid';
    payroll.payDate = new Date();
    await payroll.save();

    // Create notification
    await Notification.create({
      userId: payroll.employeeId,
      type: 'payroll_processed',
      title: 'Salary Processed',
      message: `Your salary for ${payroll.month} has been processed`,
      link: '/payroll',
    });

    res.status(200).json({
      success: true,
      message: 'Payroll processed successfully',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private (Admin)
export const deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    await payroll.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate payroll for all employees
// @route   POST /api/payroll/generate
// @access  Private (Admin)
export const generatePayrollForAll = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year',
      });
    }

    // Get all active employees
    const employees = await Employee.find({ status: 'active' });

    const payrollRecords = [];

    for (const employee of employees) {
      // Check if payroll already exists
      const existingPayroll = await Payroll.findOne({
        employeeId: employee._id,
        month,
      });

      if (!existingPayroll) {
        const payroll = await Payroll.create({
          employeeId: employee._id,
          month,
          year,
          baseSalary: employee.salaryStructure.baseSalary,
          allowances: employee.salaryStructure.allowances,
          deductions: employee.salaryStructure.deductions,
        });
        payrollRecords.push(payroll);
      }
    }

    res.status(201).json({
      success: true,
      message: `Payroll generated for ${payrollRecords.length} employees`,
      data: payrollRecords,
    });
  } catch (error) {
    next(error);
  }
};
