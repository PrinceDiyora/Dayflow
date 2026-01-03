import { create } from 'zustand'

// Notification types
export const NotificationType = {
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  LEAVE_PENDING: 'leave_pending',
  ATTENDANCE_ALERT: 'attendance_alert',
  PAYROLL_PROCESSED: 'payroll_processed',
  SYSTEM: 'system',
}

// Mock notifications
const mockNotifications = [
  {
    id: 'NOTIF001',
    type: NotificationType.LEAVE_APPROVED,
    title: 'Leave Request Approved',
    message: 'Your leave request for Jan 20-22 has been approved',
    read: false,
    timestamp: new Date('2026-01-02T10:30:00').toISOString(),
    link: '/leaves',
  },
  {
    id: 'NOTIF002',
    type: NotificationType.ATTENDANCE_ALERT,
    title: 'Attendance Reminder',
    message: 'Don\'t forget to check in for today',
    read: false,
    timestamp: new Date('2026-01-03T09:00:00').toISOString(),
    link: '/attendance',
  },
  {
    id: 'NOTIF003',
    type: NotificationType.PAYROLL_PROCESSED,
    title: 'Payroll Processed',
    message: 'Your December salary has been processed',
    read: true,
    timestamp: new Date('2025-12-31T15:00:00').toISOString(),
    link: '/payroll',
  },
]

export const useNotificationStore = create((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,

  // Add a new notification
  addNotification: (notification) => {
    const newNotification = {
      id: `NOTIF${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    }
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  // Mark all as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  // Delete notification
  deleteNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId)
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.read 
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    })
  },

  // Clear all notifications
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))
