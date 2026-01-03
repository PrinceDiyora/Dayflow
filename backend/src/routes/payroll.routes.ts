import { Router } from 'express';
import {
  getMyPayroll,
  getAllPayroll,
  updateSalary,
  processPayroll,
} from '../controllers/payroll.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export const payrollRoutes = Router();

payrollRoutes.use(authenticate);

// Employee routes
payrollRoutes.get('/me', getMyPayroll);

// Admin routes
payrollRoutes.get('/', authorize('admin', 'hr'), getAllPayroll);
payrollRoutes.put('/:userId/salary', authorize('admin', 'hr'), updateSalary);
payrollRoutes.post('/process', authorize('admin', 'hr'), processPayroll);

