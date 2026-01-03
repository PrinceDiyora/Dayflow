# Role-Based Authorization Guide

## Overview
Your HRMS now has comprehensive role-based access control (RBAC) with the following roles:
- **Admin**: Full system access
- **HR**: Manage employees, attendance, leaves, payroll
- **Employee**: Limited to own data

## Available Middleware

### 1. `protect`
**Purpose**: Verify JWT token (cookie or Bearer token)
**Use**: Apply to all protected routes
```javascript
router.use(protect); // All routes below require authentication
```

### 2. `authorize(...roles)`
**Purpose**: Allow only specific roles
**Use**: When only certain roles should access a route
```javascript
router.get('/admin-only', authorize('admin'), controller);
router.post('/hr-admin', authorize('admin', 'hr'), controller);
```

### 3. `authorizeOwnerOrAdmin(resourceIdParam = 'id')`
**Purpose**: Allow user to access own data OR admin/hr to access any data
**Use**: Profile views, personal records
```javascript
// Employee can view/edit own profile, admin/hr can view/edit any
router.get('/:id', authorizeOwnerOrAdmin(), getEmployee);
router.put('/:id', authorizeOwnerOrAdmin(), updateEmployee);

// Custom parameter name
router.get('/user/:userId', authorizeOwnerOrAdmin('userId'), getUser);
```

### 4. `requireAdmin`
**Purpose**: Admin-only access
**Use**: Critical operations like deleting users, system settings
```javascript
router.delete('/:id', requireAdmin, deleteEmployee);
router.post('/generate-all', requireAdmin, generatePayrollForAll);
```

### 5. `requireAdminOrHR`
**Purpose**: Admin or HR access
**Use**: Management operations
```javascript
router.get('/all-employees', requireAdminOrHR, getAllEmployees);
router.put('/:id/status', requireAdminOrHR, updateEmployeeStatus);
```

### 6. `restrictFields(employeeFields, adminFields)`
**Purpose**: Limit which fields can be modified based on role
**Use**: Update operations where employees should only modify certain fields
```javascript
// Employees can only update phone, address, avatar
// Admins can update any field
router.put(
  '/:id', 
  authorizeOwnerOrAdmin(),
  restrictFields(['phone', 'address', 'avatar', 'emergencyContact'], []),
  updateEmployee
);
```

### 7. `validateResourceAccess(model)`
**Purpose**: Check if resource belongs to user
**Use**: Attendance, leaves, payroll access
```javascript
import Attendance from '../models/Attendance.js';

router.get(
  '/:id', 
  validateResourceAccess(Attendance), 
  getAttendance
);
```

## Implementation Examples

### Employee Routes (Full Example)
```javascript
import express from 'express';
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
} from '../controllers/employeeController.js';
import { 
  protect, 
  authorizeOwnerOrAdmin,
  requireAdmin,
  requireAdminOrHR,
  restrictFields
} from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// GET /api/employees - Only admin/hr can list all employees
router.get('/', requireAdminOrHR, getAllEmployees);

// POST /api/employees - Only admin can create employees
router.post('/', requireAdmin, createEmployee);

// GET /api/employees/:id - View own profile or admin/hr view any
router.get('/:id', authorizeOwnerOrAdmin(), getEmployee);

// PUT /api/employees/:id - Update with field restrictions
router.put(
  '/:id',
  authorizeOwnerOrAdmin(),
  restrictFields(
    ['phone', 'address', 'avatar', 'emergencyContact'], // Employee can modify
    [] // Admin gets no restrictions
  ),
  updateEmployee
);

// DELETE /api/employees/:id - Only admin can delete
router.delete('/:id', requireAdmin, deleteEmployee);

// PUT /api/employees/:id/status - Only admin/hr can change status
router.put('/:id/status', requireAdminOrHR, updateEmployeeStatus);

export default router;
```

### Attendance Routes
```javascript
import express from 'express';
import {
  getAllAttendance,
  getAttendance,
  checkIn,
  checkOut,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';
import { protect, requireAdminOrHR, validateResourceAccess } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

router.use(protect);

// GET /api/attendance - All can access (controller filters by role)
router.get('/', getAllAttendance);

// POST /api/attendance - Only admin/hr can manually create
router.post('/', requireAdminOrHR, createAttendance);

// POST /api/attendance/checkin - Any employee can check in
router.post('/checkin', checkIn);

// POST /api/attendance/checkout - Any employee can check out
router.post('/checkout', checkOut);

// GET /api/attendance/:id - Owner or admin/hr can view
router.get('/:id', validateResourceAccess(Attendance), getAttendance);

// PUT /api/attendance/:id - Only admin/hr can modify
router.put('/:id', requireAdminOrHR, updateAttendance);

// DELETE /api/attendance/:id - Only admin/hr can delete
router.delete('/:id', requireAdminOrHR, deleteAttendance);

export default router;
```

### Leave Routes
```javascript
import express from 'express';
import {
  getAllLeaves,
  getLeave,
  applyLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from '../controllers/leaveController.js';
import { protect, requireAdminOrHR, validateResourceAccess } from '../middleware/auth.js';
import Leave from '../models/Leave.js';

const router = express.Router();

router.use(protect);

// GET /api/leaves - All can access (controller filters by role)
router.get('/', getAllLeaves);

// POST /api/leaves - Any employee can apply
router.post('/', applyLeave);

// GET /api/leaves/:id - Owner or admin/hr can view
router.get('/:id', validateResourceAccess(Leave), getLeave);

// PUT /api/leaves/:id/approve - Only admin/hr can approve
router.put('/:id/approve', requireAdminOrHR, approveLeave);

// PUT /api/leaves/:id/reject - Only admin/hr can reject
router.put('/:id/reject', requireAdminOrHR, rejectLeave);

// DELETE /api/leaves/:id - Only admin/hr can delete
router.delete('/:id', requireAdminOrHR, deleteLeave);

export default router;
```

### Payroll Routes
```javascript
import express from 'express';
import {
  getAllPayroll,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  generatePayrollForAll,
} from '../controllers/payrollController.js';
import { protect, requireAdmin, requireAdminOrHR, validateResourceAccess } from '../middleware/auth.js';
import Payroll from '../models/Payroll.js';

const router = express.Router();

router.use(protect);

// GET /api/payroll - All can access (controller filters by role)
router.get('/', getAllPayroll);

// POST /api/payroll - Only admin/hr can create
router.post('/', requireAdminOrHR, createPayroll);

// POST /api/payroll/generate - Only admin can generate for all
router.post('/generate', requireAdmin, generatePayrollForAll);

// GET /api/payroll/:id - Owner or admin/hr can view
router.get('/:id', validateResourceAccess(Payroll), getPayroll);

// PUT /api/payroll/:id - Only admin/hr can update
router.put('/:id', requireAdminOrHR, updatePayroll);

// DELETE /api/payroll/:id - Only admin can delete
router.delete('/:id', requireAdmin, deletePayroll);

export default router;
```

## Controller-Level Filtering

### How Controllers Handle Role-Based Data Access

Controllers should implement additional filtering logic:

```javascript
// Example: getAllAttendance controller
export const getAllAttendance = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    let query = {};

    // ROLE-BASED FILTERING
    if (req.user.role === 'employee') {
      // Employees only see their own records
      query.employeeId = req.user._id;
    } else if (['admin', 'hr'].includes(req.user.role)) {
      // Admin/HR can filter by employeeId or see all
      if (employeeId) {
        query.employeeId = employeeId;
      }
    }

    // Additional filters
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
```

### Update Operations with Role Checks

```javascript
export const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const isOwnProfile = req.params.id === req.user._id.toString();
    const isAdminOrHR = ['admin', 'hr'].includes(req.user.role);

    // Define editable fields for regular employees
    const employeeEditableFields = [
      'phone',
      'address',
      'avatar',
      'emergencyContact',
    ];

    // If regular employee editing own profile, restrict fields
    if (isOwnProfile && !isAdminOrHR) {
      const filteredData = {};
      employeeEditableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          filteredData[field] = req.body[field];
        }
      });
      req.body = filteredData;
    }

    // Admin/HR can modify any field
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
```

## Access Matrix

| Route | Employee | HR | Admin |
|-------|----------|-----|-------|
| GET /employees | ❌ | ✅ | ✅ |
| GET /employees/:id (own) | ✅ | ✅ | ✅ |
| GET /employees/:id (other) | ❌ | ✅ | ✅ |
| POST /employees | ❌ | ❌ | ✅ |
| PUT /employees/:id (own, limited fields) | ✅ | ✅ | ✅ |
| PUT /employees/:id (other) | ❌ | ✅ | ✅ |
| DELETE /employees/:id | ❌ | ❌ | ✅ |
| GET /attendance (own) | ✅ | ✅ | ✅ |
| GET /attendance (all) | ❌ | ✅ | ✅ |
| POST /attendance/checkin | ✅ | ✅ | ✅ |
| PUT /attendance/:id | ❌ | ✅ | ✅ |
| GET /leaves (own) | ✅ | ✅ | ✅ |
| GET /leaves (all) | ❌ | ✅ | ✅ |
| POST /leaves | ✅ | ✅ | ✅ |
| PUT /leaves/:id/approve | ❌ | ✅ | ✅ |
| GET /payroll (own) | ✅ | ✅ | ✅ |
| GET /payroll (all) | ❌ | ✅ | ✅ |
| POST /payroll/generate | ❌ | ❌ | ✅ |

## Security Best Practices

1. **Always use `protect` first**: Ensure routes are authenticated
2. **Combine middleware**: Stack multiple middleware for layered security
3. **Controller validation**: Double-check permissions in controllers
4. **Field restrictions**: Prevent privilege escalation via field modification
5. **Audit logging**: Log sensitive operations (implemented in controllers)
6. **Error messages**: Don't reveal system details in 403 errors

## Testing Authorization

### Test as Employee
```bash
# Login as employee
POST http://localhost:5000/api/auth/login
{ "email": "emp@example.com", "password": "password" }

# Can view own profile ✅
GET http://localhost:5000/api/employees/{own_id}

# Cannot view other profiles ❌
GET http://localhost:5000/api/employees/{other_id}

# Can view own attendance ✅
GET http://localhost:5000/api/attendance?employeeId={own_id}
```

### Test as Admin
```bash
# Login as admin
POST http://localhost:5000/api/auth/login
{ "email": "admin@example.com", "password": "password" }

# Can view all employees ✅
GET http://localhost:5000/api/employees

# Can delete employee ✅
DELETE http://localhost:5000/api/employees/{any_id}

# Can generate payroll for all ✅
POST http://localhost:5000/api/payroll/generate
```

## Quick Reference

```javascript
// Require authentication
router.use(protect);

// Admin only
router.delete('/:id', requireAdmin, deleteController);

// Admin or HR only
router.get('/all', requireAdminOrHR, getAllController);

// Owner or Admin/HR
router.get('/:id', authorizeOwnerOrAdmin(), getController);

// Specific roles
router.post('/special', authorize('admin', 'hr'), specialController);

// Resource ownership validation
router.get('/:id', validateResourceAccess(Model), getController);

// Field restrictions
router.put(
  '/:id',
  authorizeOwnerOrAdmin(),
  restrictFields(['field1', 'field2'], []),
  updateController
);
```
