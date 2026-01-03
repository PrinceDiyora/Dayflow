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

// All employee routes require admin/hr role
employeesRoutes.use(authenticate);
employeesRoutes.use(authorize('admin', 'hr'));

employeesRoutes.get('/', getAllEmployees);
employeesRoutes.get('/:id', getEmployeeById);
employeesRoutes.post('/', createEmployee);
employeesRoutes.put('/:id', updateEmployee);
employeesRoutes.delete('/:id', deleteEmployee);

