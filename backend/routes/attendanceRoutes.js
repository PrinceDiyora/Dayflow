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
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getAllAttendance)
  .post(authorize('admin', 'hr'), createAttendance);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

router
  .route('/:id')
  .get(getAttendance)
  .put(authorize('admin', 'hr'), updateAttendance)
  .delete(authorize('admin', 'hr'), deleteAttendance);

export default router;
