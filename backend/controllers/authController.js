import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new employee
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { employeeId, email, password, name, phone } = req.body;

    // Validate required fields
    if (!employeeId || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ employeeId }, { email }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: existingEmployee.employeeId === employeeId
          ? 'Employee ID already exists'
          : 'Email already exists',
      });
    }

    // All signups are employee role
    const position = 'Employee';
    const salary = 50000;

    // Create employee (password will be hashed by pre-save middleware)
    const employee = await Employee.create({
      employeeId,
      email,
      password,
      name,
      phone,
      role: 'employee',
      position,
      salary,
      emailVerified: true, // Auto-verify since no email verification
    });

    // Generate token
    const token = generateToken(employee._id);

    // Remove password from response
    const employeeData = employee.toObject();
    delete employeeData.password;

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        user: employeeData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login employee
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or employee ID and password',
      });
    }

    // Find employee by email or employeeId and include password field
    const employee = await Employee.findOne({
      $or: [
        { email: email },
        { employeeId: email } // Allow login with employeeId as well
      ]
    }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches using bcrypt
    const isPasswordMatch = await employee.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (employee.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact admin.',
      });
    }

    // Generate token
    const token = generateToken(employee._id);

    // Remove password from response
    const employeeData = employee.toObject();
    delete employeeData.password;

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: employeeData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const employee = await Employee.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await employee.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    employee.password = newPassword;
    await employee.save();

    const token = generateToken(employee._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};
