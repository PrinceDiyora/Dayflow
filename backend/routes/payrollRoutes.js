import express from 'express';
import {
  getAllPayroll,
  getPayroll,
  createPayroll,
  updatePayroll,
  processPayroll,
  deletePayroll,
  generatePayrollForAll,
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getAllPayroll)
  .post(authorize('admin', 'hr'), createPayroll);

router
  .route('/generate')
  .post(authorize('admin'), generatePayrollForAll);

router
  .route('/:id')
  .get(getPayroll)
  .put(authorize('admin', 'hr'), updatePayroll)
  .delete(authorize('admin'), deletePayroll);

router
  .route('/:id/process')
  .put(authorize('admin'), processPayroll);

export default router;
