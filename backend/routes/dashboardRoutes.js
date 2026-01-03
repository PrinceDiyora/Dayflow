import express from 'express';
import {
  getEmployeeDashboard,
  getAdminDashboard,
  getAttendanceOverview,
  getLeaveStats,
} from '../controllers/dashboardController.js';
import { protect, requireAdminOrHR } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// GET /api/dashboard/employee - Employee dashboard data
router.get('/employee', getEmployeeDashboard);

// GET /api/dashboard/admin - Admin/HR dashboard data
router.get('/admin', requireAdminOrHR, getAdminDashboard);

// GET /api/dashboard/attendance-overview - Attendance overview with date range
router.get('/attendance-overview', requireAdminOrHR, getAttendanceOverview);

// GET /api/dashboard/leave-stats - Leave statistics by year
router.get('/leave-stats', requireAdminOrHR, getLeaveStats);

export default router;
