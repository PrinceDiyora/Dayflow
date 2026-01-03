import express from 'express';
import {
  getAllLeaves,
  getLeave,
  applyLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getAllLeaves)
  .post(applyLeave);

router
  .route('/:id')
  .get(getLeave)
  .delete(deleteLeave);

router
  .route('/:id/approve')
  .put(authorize('admin', 'hr'), approveLeave);

router
  .route('/:id/reject')
  .put(authorize('admin', 'hr'), rejectLeave);

export default router;
