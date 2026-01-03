import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function MainLayout({ children }) {
  const location = useLocation()
  const { user } = useAuthStore()
  
  // If on dashboard/attendance/leaves and user is employee, don't show sidebar/navbar (pages have their own nav)
  const isEmployeePage = (location.pathname === '/dashboard' || 
                         location.pathname === '/attendance' || 
                         location.pathname === '/leaves') && 
                         (user?.role === 'employee' || !user?.role)
  
  if (isEmployeePage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 pt-16">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

