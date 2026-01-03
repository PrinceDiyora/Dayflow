import { Router } from 'express';
import {
  getMyLeaves,
  getAllLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
} from '../controllers/leaves.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export const leavesRoutes = Router();

leavesRoutes.use(authenticate);

// Employee routes
leavesRoutes.get('/me', getMyLeaves);
leavesRoutes.post('/', applyLeave);

// Admin routes
leavesRoutes.get('/', authorize('admin', 'hr'), getAllLeaves);
leavesRoutes.post('/:id/approve', authorize('admin', 'hr'), approveLeave);
leavesRoutes.post('/:id/reject', authorize('admin', 'hr'), rejectLeave);

