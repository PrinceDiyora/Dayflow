import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employees.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export const employeesRoutes = Router();

// All routes require authentication
employeesRoutes.use(authenticate);

// View routes - available to all authenticated users
employeesRoutes.get('/', getAllEmployees);
employeesRoutes.get('/:id', getEmployeeById);

// Create/Update/Delete routes - admin/hr only
employeesRoutes.post('/', authorize('admin', 'hr'), createEmployee);
employeesRoutes.put('/:id', authorize('admin', 'hr'), updateEmployee);
employeesRoutes.delete('/:id', authorize('admin', 'hr'), deleteEmployee);

