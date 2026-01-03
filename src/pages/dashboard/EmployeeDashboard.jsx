import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { 
  User, Calendar, Clock, FileText, CheckCircle2, XCircle, 
  AlertCircle, TrendingUp, CalendarDays
} from 'lucide-react'

// Generate dummy data for current month attendance
const generateCurrentMonthAttendance = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  
  let present = 0
  let absent = 0
  let late = 0
  
  for (let day = 1; day <= today; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    
    const status = Math.random() > 0.95 ? 'absent' : 'present'
    const isLate = Math.random() > 0.85
    
    if (status === 'present') {
      present++
      if (isLate) late++
    } else {
      absent++
    }
  }
  
  return { present, absent, late, total: present + absent }
}

// Generate dummy leave requests
const generateLeaveRequests = () => {
  const statuses = ['approved', 'pending', 'rejected']
  const types = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Emergency Leave']
  
  return [
    {
      id: 'LR001',
      type: types[0],
      startDate: '2024-12-15',
      endDate: '2024-12-16',
      days: 2,
      reason: 'Medical checkup',
      status: 'approved',
      appliedOn: '2024-12-10'
    },
    {
      id: 'LR002',
      type: types[1],
      startDate: '2025-01-10',
      endDate: '2025-01-12',
      days: 3,
      reason: 'Personal work',
      status: 'pending',
      appliedOn: '2025-01-05'
    },
    {
      id: 'LR003',
      type: types[2],
      startDate: '2024-11-20',
      endDate: '2024-11-22',
      days: 3,
      reason: 'Family function',
      status: 'approved',
      appliedOn: '2024-11-15'
    },
    {
      id: 'LR004',
      type: types[3],
      startDate: '2024-12-25',
      endDate: '2024-12-25',
      days: 1,
      reason: 'Emergency',
      status: 'rejected',
      appliedOn: '2024-12-24'
    },
    {
      id: 'LR005',
      type: types[1],
      startDate: '2025-01-15',
      endDate: '2025-01-15',
      days: 1,
      reason: 'Personal appointment',
      status: 'pending',
      appliedOn: '2025-01-10'
    },
  ]
}

export function EmployeeDashboard() {
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState('overview')
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, total: 0 })
  const [leaveRequests, setLeaveRequests] = useState([])

  useEffect(() => {
    const stats = generateCurrentMonthAttendance()
    setAttendanceStats(stats)
    
    const leaves = generateLeaveRequests()
    setLeaveRequests(leaves)
  }, [])

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentMonth = monthNames[new Date().getMonth()]
  const currentYear = new Date().getFullYear()

  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved')
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending')
  const rejectedLeaves = leaveRequests.filter(l => l.status === 'rejected')

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance Summary', icon: CalendarDays },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 border-4 border-primary/10">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-3 font-semibold text-lg text-gray-900">{user?.name || 'Employee Name'}</h3>
            <p className="text-sm text-gray-500">{user?.employeeId || 'EMP001'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs capitalize">{user?.role || 'employee'}</Badge>
              <Badge variant="success" className="text-xs">Active</Badge>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="text-xs font-semibold text-gray-500 mb-3">QUICK STATS</div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">This Month</span>
            <Badge variant="outline" className="text-xs">{currentMonth}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Present Days</span>
            <Badge variant="success" className="text-xs">{attendanceStats.present}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Pending Leaves</span>
            <Badge variant="warning" className="text-xs">{pendingLeaves.length}</Badge>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Employee'}!</p>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Attendance</p>
                        <p className="text-3xl font-bold text-gray-900">{attendanceStats.total}</p>
                        <p className="text-xs text-gray-400 mt-1">{currentMonth} {currentYear}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Days Present</p>
                        <p className="text-3xl font-bold text-green-600">{attendanceStats.present}</p>
                        <p className="text-xs text-gray-400 mt-1">On-time arrivals</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Late Arrivals</p>
                        <p className="text-3xl font-bold text-orange-600">{attendanceStats.late}</p>
                        <p className="text-xs text-gray-400 mt-1">After 9:30 AM</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Clock className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Absent Days</p>
                        <p className="text-3xl font-bold text-red-600">{attendanceStats.absent}</p>
                        <p className="text-xs text-gray-400 mt-1">This month</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-lg">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Employee Details Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Employee Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Employee ID:</span>
                        <span className="text-sm font-semibold text-gray-900">{user?.employeeId || 'EMP001'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Full Name:</span>
                        <span className="text-sm font-semibold text-gray-900">{user?.name || 'Employee Name'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-semibold text-gray-900">{user?.email || 'email@company.com'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-semibold text-gray-900">{user?.phone || '+1 234-567-8900'}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="text-sm font-semibold text-gray-900">{user?.department || 'Engineering'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Position:</span>
                        <span className="text-sm font-semibold text-gray-900">{user?.position || 'Employee'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Role:</span>
                        <Badge variant="secondary" className="capitalize">{user?.role || 'employee'}</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Approved Leaves</h3>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">{approvedLeaves.length}</p>
                    <p className="text-xs text-gray-500">Leave requests approved</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Pending Leaves</h3>
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-600 mb-2">{pendingLeaves.length}</p>
                    <p className="text-xs text-gray-500">Awaiting approval</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Rejected Leaves</h3>
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-600 mb-2">{rejectedLeaves.length}</p>
                    <p className="text-xs text-gray-500">Leave requests rejected</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Attendance Summary Section */}
          {activeSection === 'attendance' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Attendance Summary</h1>
                <p className="text-gray-500 mt-1">{currentMonth} {currentYear}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Present Days</p>
                            <p className="text-xs text-gray-500">Working days attended</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Late Arrivals</p>
                            <p className="text-xs text-gray-500">After 9:30 AM</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{attendanceStats.late}</p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Absent Days</p>
                            <p className="text-xs text-gray-500">Days not marked</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Days</p>
                            <p className="text-xs text-gray-500">Working days in month</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{attendanceStats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative w-48 h-48">
                        <svg className="transform -rotate-90 w-48 h-48">
                          <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="#e5e7eb"
                            strokeWidth="16"
                            fill="none"
                          />
                          <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="#10b981"
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 88}`}
                            strokeDashoffset={`${2 * Math.PI * 88 * (1 - attendanceStats.present / attendanceStats.total)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-4xl font-bold text-gray-900">
                            {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
                          </p>
                          <p className="text-sm text-gray-500">Attendance</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-6 text-center">
                        {attendanceStats.present} out of {attendanceStats.total} days present
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Leave Requests Section */}
          {activeSection === 'leaves' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
                <p className="text-gray-500 mt-1">All your leave applications and their status</p>
              </div>

              {/* Approved Leaves */}
              <Card className="mb-6">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Approved Leaves ({approvedLeaves.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {approvedLeaves.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No approved leave requests</p>
                  ) : (
                    <div className="space-y-3">
                      {approvedLeaves.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="success" className="text-xs">{leave.type}</Badge>
                              <span className="text-sm font-semibold text-gray-900">{leave.id}</span>
                            </div>
                            <p className="text-sm text-gray-600">{leave.reason}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>From: {formatDate(leave.startDate)}</span>
                              <span>To: {formatDate(leave.endDate)}</span>
                              <span className="font-semibold">{leave.days} day(s)</span>
                            </div>
                          </div>
                          <Badge variant="success">Approved</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Leaves */}
              <Card className="mb-6">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    Pending Leaves ({pendingLeaves.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {pendingLeaves.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending leave requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingLeaves.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="warning" className="text-xs">{leave.type}</Badge>
                              <span className="text-sm font-semibold text-gray-900">{leave.id}</span>
                            </div>
                            <p className="text-sm text-gray-600">{leave.reason}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>From: {formatDate(leave.startDate)}</span>
                              <span>To: {formatDate(leave.endDate)}</span>
                              <span className="font-semibold">{leave.days} day(s)</span>
                            </div>
                          </div>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rejected Leaves */}
              <Card>
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    Rejected Leaves ({rejectedLeaves.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {rejectedLeaves.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No rejected leave requests</p>
                  ) : (
                    <div className="space-y-3">
                      {rejectedLeaves.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="destructive" className="text-xs">{leave.type}</Badge>
                              <span className="text-sm font-semibold text-gray-900">{leave.id}</span>
                            </div>
                            <p className="text-sm text-gray-600">{leave.reason}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>From: {formatDate(leave.startDate)}</span>
                              <span>To: {formatDate(leave.endDate)}</span>
                              <span className="font-semibold">{leave.days} day(s)</span>
                            </div>
                          </div>
                          <Badge variant="destructive">Rejected</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
