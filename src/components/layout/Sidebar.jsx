import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  User, 
  Clock, 
  Calendar, 
  DollarSign,
  LogOut 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Clock, label: 'Attendance', path: '/attendance' },
  { icon: Calendar, label: 'Leaves', path: '/leaves' },
  { icon: DollarSign, label: 'Payroll', path: '/payroll' },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  // Filter menu based on role
  const filteredMenu = menuItems.filter(item => {
    if (item.path === '/payroll' && user?.role === 'employee') {
      return true // Employees can view their own payroll
    }
    return true
  })

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Dayflow</h1>
        <p className="text-sm text-muted-foreground">HRMS</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

