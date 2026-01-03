import { Router } from 'express';
import {
  getMyAttendance,
  getAllAttendance,
  checkIn,
  checkOut,
  getTodayAttendance,
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export const attendanceRoutes = Router();

attendanceRoutes.use(authenticate);

// Employee routes
attendanceRoutes.get('/me', getMyAttendance);
attendanceRoutes.get('/today', getTodayAttendance);
attendanceRoutes.post('/check-in', checkIn);
attendanceRoutes.post('/check-out', checkOut);

// Admin routes
attendanceRoutes.get('/', authorize('admin', 'hr'), getAllAttendance);

