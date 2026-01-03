import { Router } from 'express';
import {
  getMyPayslips,
  getPayslipById,
  downloadPayslip,
} from '../controllers/payslips.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const payslipsRoutes = Router();

payslipsRoutes.use(authenticate);

payslipsRoutes.get('/me', getMyPayslips);
payslipsRoutes.get('/:id', getPayslipById);
payslipsRoutes.get('/:id/download', downloadPayslip);

