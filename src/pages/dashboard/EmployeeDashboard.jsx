import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/authStore'
import { employeeAPI, attendanceAPI, leaveAPI } from '@/mocks/api'
import { User, LogOut, Search, Plane, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Set active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === '/attendance') return 'attendance'
    if (location.pathname === '/leaves') return 'timeoff'
    return 'employees'
  }
  const activeTab = getActiveTab()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
          employeeAPI.getAll(),
          attendanceAPI.getAll(),
          leaveAPI.getAll(),
        ])
        setEmployees(employeesRes.data)
        setAttendance(attendanceRes.data)
        setLeaves(leavesRes.data)

        // Get today's attendance for current user
        const today = new Date().toISOString().split('T')[0]
        const todayAtt = attendanceRes.data.find(
          att => att.employeeId === user?.id && att.date === today
        )
        setTodayAttendance(todayAtt)
      } catch (error) {
        console.error('Failed to fetch data', error)
      }
    }

    fetchData()
  }, [user])

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const getEmployeeStatus = (employee) => {
    const today = new Date().toISOString().split('T')[0]
    
    // Check if employee is on leave today
    const todayLeave = leaves.find(
      leave => leave.employeeId === employee.id &&
      leave.status === 'approved' &&
      new Date(leave.startDate) <= new Date(today) &&
      new Date(leave.endDate) >= new Date(today)
    )
    
    if (todayLeave) {
      return 'leave'
    }

    // Check today's attendance
    const todayAtt = attendance.find(
      att => att.employeeId === employee.id && att.date === today
    )

    if (todayAtt) {
      if (todayAtt.status === 'present' && todayAtt.checkIn) {
        return 'present'
      }
      if (todayAtt.status === 'absent') {
        return 'absent'
      }
    }

    return 'absent'
  }

  const getStatusIcon = (status) => {
    // Return circular outline as shown in wireframe (just outline, not filled)
    switch (status) {
      case 'present':
        return <div className="w-3 h-3 rounded-full border border-black bg-green-500"></div>
      case 'leave':
        return <Plane className="w-3 h-3 text-blue-500" />
      case 'absent':
        return <div className="w-3 h-3 rounded-full border border-black"></div>
      default:
        return <div className="w-3 h-3 rounded-full border border-black"></div>
    }
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const response = await attendanceAPI.checkIn(user.id)
      setTodayAttendance(response.data)
      toast.success('Checked in successfully!')
      // Refresh attendance
      const attendanceRes = await attendanceAPI.getAll()
      setAttendance(attendanceRes.data)
    } catch (error) {
      toast.error(error.message || 'Failed to check in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      const response = await attendanceAPI.checkOut(user.id)
      setTodayAttendance(response.data)
      toast.success('Checked out successfully!')
      // Refresh attendance
      const attendanceRes = await attendanceAPI.getAll()
      setAttendance(attendanceRes.data)
    } catch (error) {
      toast.error(error.message || 'Failed to check out')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatTime = (time) => {
    if (!time) return '00:00 PM'
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCurrentUserStatus = () => {
    if (!user) return 'absent'
    const today = new Date().toISOString().split('T')[0]
    
    // Check if user is on leave today
    const todayLeave = leaves.find(
      leave => leave.employeeId === user.id &&
      leave.status === 'approved' &&
      new Date(leave.startDate) <= new Date(today) &&
      new Date(leave.endDate) >= new Date(today)
    )
    
    if (todayLeave) {
      return 'leave'
    }

    // Check today's attendance
    if (todayAttendance) {
      if (todayAttendance.status === 'present' && todayAttendance.checkIn) {
        return 'present'
      }
      if (todayAttendance.status === 'absent') {
        return 'absent'
      }
    }

    return 'absent'
  }

  const currentUserStatus = getCurrentUserStatus()

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black flex items-center justify-between px-6 z-50">
        {/* Left Side: Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Company Logo - white box with black outline */}
          <div className="px-4 py-2 border border-black bg-white text-black text-sm font-medium">
            Company Logo
          </div>
          <div className="flex items-center gap-0">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 text-sm font-medium border border-black transition-colors ${
                activeTab === 'employees' || location.pathname === '/dashboard'
                  ? 'bg-blue-200 text-black'
                  : 'text-black bg-white hover:bg-gray-50'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className={`px-4 py-2 text-sm font-medium border border-black transition-colors ${
                activeTab === 'attendance' || location.pathname === '/attendance'
                  ? 'bg-blue-200 text-black'
                  : 'text-black bg-white hover:bg-gray-50'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => navigate('/leaves')}
              className={`px-4 py-2 text-sm font-medium border border-black transition-colors ${
                activeTab === 'timeoff' || location.pathname === '/leaves'
                  ? 'bg-blue-200 text-black'
                  : 'text-black bg-white hover:bg-gray-50'
              }`}
            >
              Time Off
            </button>
          </div>
        </div>

        {/* Right Side: Search and Avatar */}
        <div className="flex items-center gap-4">
          {/* Search Bar - black outline, gray placeholder */}
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 border border-black placeholder:text-gray-500"
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative flex items-center gap-2">
                {/* Red circle indicator */}
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                {/* Light blue square avatar */}
                <div className="w-8 h-8 bg-blue-200 border border-black"></div>
                {/* Dropdown indicator - light blue triangles pointing right */}
                <div className="flex items-center gap-0.5 ml-1">
                  <div className="w-0 h-0 border-l-[3px] border-l-blue-300 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div>
                  <div className="w-0 h-0 border-l-[3px] border-l-blue-300 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 p-6">
        
        {/* Personal Dashboard Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-gray-500">Here's what's happening today.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Attendance Card */}
            <Card className="border-black shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Today's Attendance</h3>
                  <div className={`p-2 rounded-full ${
                    todayAttendance?.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Check In</span>
                    <span className="font-medium">{formatTime(todayAttendance?.checkIn) || '--:--'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Check Out</span>
                    <span className="font-medium">{formatTime(todayAttendance?.checkOut) || '--:--'}</span>
                  </div>
                  
                  <div className="pt-2">
                    {!todayAttendance?.checkIn ? (
                      <Button 
                        onClick={handleCheckIn} 
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isLoading ? 'Loading...' : 'Check In'}
                      </Button>
                    ) : !todayAttendance?.checkOut ? (
                      <Button 
                        onClick={handleCheckOut} 
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isLoading ? 'Loading...' : 'Check Out'}
                      </Button>
                    ) : (
                      <div className="text-center text-sm font-medium text-green-600 bg-green-50 py-2 rounded">
                        Completed for today
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Balance Card */}
            <Card className="border-black shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Leave Balance</h3>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">{currentUser?.leaveBalance?.remaining || 0}</div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Remaining</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">{currentUser?.leaveBalance?.used || 0}</div>
                      <div className="text-xs text-gray-500 uppercase font-medium">Used</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-black hover:bg-gray-50" onClick={() => navigate('/leaves')}>
                    Apply Leave
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats / Team Card */}
            <Card className="border-black shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">My Team</h3>
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Department</span>
                    <span className="font-medium">{currentUser?.department || 'General'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Team Members</span>
                    <span className="font-medium">
                      {employees.filter(e => e.department === currentUser?.department).length}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full border-black hover:bg-gray-50" onClick={() => navigate('/dashboard')}>
                    View Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Team Directory</h2>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white border border-black">
            NEW
          </Button>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-6">
          {filteredEmployees.map((employee) => {
            const status = getEmployeeStatus(employee)
            return (
              <Card key={employee.id} className="border-black hover:shadow-lg transition-shadow cursor-pointer bg-white">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3 relative">
                    {/* Status Indicator - circular outline in top-right */}
                    <div className="absolute top-2 right-2">
                      {getStatusIcon(status)}
                    </div>
                    {/* Profile Picture - light blue square with person icon */}
                    <div className="w-20 h-20 bg-blue-200 flex items-center justify-center border border-black">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    {/* Employee Name */}
                    <div>
                      <h3 className="font-medium text-sm text-black">{employee.name}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
