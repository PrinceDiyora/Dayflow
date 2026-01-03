import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/protected-route';
import { LoginPage } from '@/pages/auth/login';
import { SignupPage } from '@/pages/auth/signup';
import { EmployeeDashboard } from '@/pages/dashboard/employee-dashboard';
import { AdminDashboard } from '@/pages/dashboard/admin-dashboard';
import { ProfilePage } from '@/pages/profile/profile';
import { ChangePasswordPage } from '@/pages/profile/change-password';
import { EmployeesPage } from '@/pages/employees/employees';
import { AttendancePage } from '@/pages/attendance/attendance';
import { LeavesPage } from '@/pages/leaves/leaves';
import { PayrollPage } from '@/pages/payroll/payroll';
import { PayslipsPage } from '@/pages/payslips/payslips';
import { SettingsPage } from '@/pages/settings/settings';
import { ReportsPage } from '@/pages/reports/reports';
import { NotFoundPage } from '@/pages/404';
import { AppLayout } from '@/components/layout/app-layout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/employee" replace />,
      },
      {
        path: 'dashboard/employee',
        element: (
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'employees',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <EmployeesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance',
        element: <AttendancePage />,
      },
      {
        path: 'leaves',
        element: <LeavesPage />,
      },
      {
        path: 'payroll',
        element: <PayrollPage />,
      },
      {
        path: 'payslips',
        element: <PayslipsPage />,
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

