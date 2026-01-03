import express from 'express';
import {
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
} from '../controllers/employeeController.js';
import { 
  protect, 
  authorize, 
  authorizeOwnerOrAdmin,
  requireAdmin,
  requireAdminOrHR 
} from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Get all employees - Only Admin/HR can see all, employees redirected
router
  .route('/')
  .get(requireAdminOrHR, getAllEmployees);

// Get, update, delete single employee
router
  .route('/:id')
  .get(authorizeOwnerOrAdmin(), getEmployee) // Can view own profile or admin/hr can view any
  .put(authorizeOwnerOrAdmin(), updateEmployee) // Can update own profile or admin/hr can update any
  .delete(requireAdmin, deleteEmployee); // Only admin can delete

// Update employee status - Only Admin/HR
router
  .route('/:id/status')
  .put(requireAdminOrHR, updateEmployeeStatus);

export default router;
