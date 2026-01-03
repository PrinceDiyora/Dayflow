import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toast'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Login } from '@/pages/auth/Login'
import { Signup } from '@/pages/auth/Signup'
import { EmployeeDashboard } from '@/pages/dashboard/EmployeeDashboard'
import { AdminDashboard } from '@/pages/dashboard/AdminDashboard'
import { Profile } from '@/pages/profile/Profile'
import { Attendance } from '@/pages/attendance/Attendance'
import { Leaves } from '@/pages/leaves/Leaves'
import { Payroll } from '@/pages/payroll/Payroll'
import { useAuthStore } from '@/store/authStore'

function DashboardRoute() {
  const { user } = useAuthStore()
  
  if (user?.role === 'admin' || user?.role === 'hr') {
    return <AdminDashboard />
  }
  return <EmployeeDashboard />
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Navigate to="/dashboard" replace />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardRoute />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Attendance />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Leaves />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Payroll />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

