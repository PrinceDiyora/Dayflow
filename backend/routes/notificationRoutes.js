import express from 'express';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getAllNotifications)
  .delete(clearAllNotifications);

router
  .route('/read-all')
  .put(markAllAsRead);

router
  .route('/:id')
  .delete(deleteNotification);

router
  .route('/:id/read')
  .put(markAsRead);

export default router;
