import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first (preferred method)
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Fallback: Check for token in Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await Employee.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin/hr
export const authorizeOwnerOrAdmin = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Admin and HR can access any resource
    if (['admin', 'hr'].includes(userRole)) {
      return next();
    }

    // Employee can only access their own resource
    if (resourceId === userId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You can only access your own data',
    });
  };
};

// Check if user can modify the resource
export const authorizeModification = (allowedRoles = ['admin', 'hr']) => {
  return (req, res, next) => {
    const resourceId = req.params.id;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Specified roles (admin/hr) can modify any resource
    if (allowedRoles.includes(userRole)) {
      req.canModifyAll = true;
      return next();
    }

    // Regular employee can only modify their own data
    if (resourceId === userId) {
      req.canModifyAll = false;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You are not authorized to modify this resource',
    });
  };
};

// Restrict fields that can be modified based on role
export const restrictFields = (employeeFields = [], adminFields = []) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    // Admin and HR can modify all fields
    if (['admin', 'hr'].includes(userRole)) {
      return next();
    }

    // Regular employee - filter allowed fields only
    const allowedFields = {};
    employeeFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        allowedFields[field] = req.body[field];
      }
    });

    // Prevent modification of sensitive fields
    const restrictedFields = ['role', 'salary', 'salaryStructure', 'status', 'employeeId', 'leaveBalance'];
    restrictedFields.forEach((field) => {
      if (req.body[field] !== undefined && !adminFields.includes(field)) {
        return res.status(403).json({
          success: false,
          message: `You are not authorized to modify the '${field}' field`,
        });
      }
    });

    req.body = allowedFields;
    next();
  };
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }
  next();
};

// Check if user is admin or HR
export const requireAdminOrHR = (req, res, next) => {
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or HR role required.',
    });
  }
  next();
};

// Validate resource ownership for query operations
export const validateResourceAccess = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userRole = req.user.role;

      // Admin and HR can access all resources
      if (['admin', 'hr'].includes(userRole)) {
        return next();
      }

      // For employees, check if resource belongs to them
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if resource has an employeeId or user field
      const resourceOwnerId = resource.employeeId || resource.employee || resource.user;
      
      if (resourceOwnerId && resourceOwnerId.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error validating resource access',
      });
    }
  };
};
