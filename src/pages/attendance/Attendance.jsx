import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { 
  CalendarDays, Clock, Users, CheckCircle2, XCircle, 
  Calendar, ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react'

// Generate dummy attendance data for an employee
const generateEmployeeAttendance = (year, month, employeeId = null) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const attendance = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    
    // Skip future dates
    if (date > new Date()) continue
    
    const checkInHour = 8 + Math.floor(Math.random() * 2)
    const checkInMinute = Math.floor(Math.random() * 60)
    const checkOutHour = 17 + Math.floor(Math.random() * 3)
    const checkOutMinute = Math.floor(Math.random() * 60)
    
    const hoursWorked = (checkOutHour - checkInHour) + ((checkOutMinute - checkInMinute) / 60)
    const isLate = checkInHour >= 10 || (checkInHour === 9 && checkInMinute > 30)
    const status = Math.random() > 0.95 ? 'absent' : 'present'
    
    attendance.push({
      id: `att-${employeeId || 'emp'}-${year}-${month}-${day}`,
      date: date,
      checkIn: status !== 'absent' ? `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}` : null,
      checkOut: status !== 'absent' ? `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}` : null,
      hoursWorked: status !== 'absent' ? hoursWorked.toFixed(2) : '0',
      status,
      isLate: status !== 'absent' ? isLate : false,
    })
  }
  
  return attendance
}

// Generate dummy employee list with attendance summary
const generateEmployeeList = (year, month) => {
  const employees = [
    { id: 'EMP001', name: 'John Doe', department: 'Engineering', position: 'Senior Developer' },
    { id: 'EMP002', name: 'Jane Smith', department: 'Marketing', position: 'Marketing Manager' },
    { id: 'EMP003', name: 'Mike Johnson', department: 'Sales', position: 'Sales Executive' },
    { id: 'EMP004', name: 'Sarah Williams', department: 'HR', position: 'HR Manager' },
    { id: 'EMP005', name: 'David Brown', department: 'Engineering', position: 'Frontend Developer' },
    { id: 'EMP006', name: 'Emily Davis', department: 'Finance', position: 'Accountant' },
    { id: 'EMP007', name: 'Robert Wilson', department: 'Operations', position: 'Operations Manager' },
    { id: 'EMP008', name: 'Lisa Anderson', department: 'Engineering', position: 'Backend Developer' },
  ]

  return employees.map(emp => {
    const attendance = generateEmployeeAttendance(year, month, emp.id)
    const present = attendance.filter(a => a.status === 'present').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const late = attendance.filter(a => a.isLate).length
    const totalDays = attendance.length

    return {
      ...emp,
      present,
      absent,
      late,
      totalDays,
      attendanceRate: ((present / totalDays) * 100).toFixed(1)
    }
  })
}

export function Attendance() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeSection, setActiveSection] = useState(isAdmin ? 'overview' : 'myAttendance')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeAttendance, setEmployeeAttendance] = useState([])
  const [employeeList, setEmployeeList] = useState([])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    if (isAdmin) {
      const employees = generateEmployeeList(selectedYear, selectedMonth)
      setEmployeeList(employees)
    } else {
      const attendance = generateEmployeeAttendance(selectedYear, selectedMonth, user?.employeeId)
      setEmployeeAttendance(attendance)
    }
  }, [selectedMonth, selectedYear, isAdmin, user])

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const handleViewEmployeeDetails = (employee) => {
    const attendance = generateEmployeeAttendance(selectedYear, selectedMonth, employee.id)
    setEmployeeAttendance(attendance)
    setSelectedEmployee(employee)
    setActiveSection('employeeDetails')
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
    return { full: `${day}/${month}/${year}`, day: dayName }
  }

  const calculateStats = () => {
    const present = employeeAttendance.filter(a => a.status === 'present').length
    const absent = employeeAttendance.filter(a => a.status === 'absent').length
    const late = employeeAttendance.filter(a => a.isLate).length
    const totalDays = employeeAttendance.length
    
    return { present, absent, late, totalDays }
  }

  const stats = !isAdmin || activeSection === 'employeeDetails' ? calculateStats() : null

  const sidebarItems = isAdmin ? [
    { id: 'overview', label: 'Employee Overview', icon: Users },
    ...(selectedEmployee ? [{ id: 'employeeDetails', label: 'Employee Details', icon: UserIcon }] : []),
  ] : [
    { id: 'myAttendance', label: 'My Attendance', icon: CalendarDays },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Attendance</h3>
              <p className="text-xs text-gray-500">{isAdmin ? 'Admin View' : 'Employee View'}</p>
            </div>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Button
              onClick={handlePreviousMonth}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold text-gray-700">
              {monthNames[selectedMonth]} {selectedYear}
            </div>
            <Button
              onClick={handleNextMonth}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Statistics Summary */}
        {stats && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="text-xs font-semibold text-gray-500 mb-3">MONTHLY SUMMARY</div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Present</span>
              <Badge variant="success" className="text-xs">{stats.present}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Absent</span>
              <Badge variant="destructive" className="text-xs">{stats.absent}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Late</span>
              <Badge variant="warning" className="text-xs">{stats.late}</Badge>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs font-semibold text-gray-700">Total Days</span>
              <Badge variant="secondary" className="text-xs">{stats.totalDays}</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Employee View - My Attendance */}
          {!isAdmin && activeSection === 'myAttendance' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
                <p className="text-gray-500 mt-1">View your attendance records for {monthNames[selectedMonth]} {selectedYear}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Days</p>
                        <p className="text-2xl font-bold">{stats.totalDays}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Present</p>
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Late Arrivals</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeAttendance.map((att) => {
                        const { full, day } = formatDate(att.date)
                        return (
                          <TableRow key={att.id}>
                            <TableCell className="font-medium">{full}</TableCell>
                            <TableCell>{day}</TableCell>
                            <TableCell>
                              {att.checkIn || <span className="text-gray-400">-</span>}
                              {att.isLate && <Badge variant="warning" className="ml-2 text-xs">Late</Badge>}
                            </TableCell>
                            <TableCell>{att.checkOut || <span className="text-gray-400">-</span>}</TableCell>
                            <TableCell>{att.hoursWorked} hrs</TableCell>
                            <TableCell>
                              <Badge variant={att.status === 'present' ? 'success' : 'destructive'} className="capitalize">
                                {att.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin View - Employee Overview */}
          {isAdmin && activeSection === 'overview' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Employee Attendance Overview</h1>
                <p className="text-gray-500 mt-1">View attendance summary for all employees in {monthNames[selectedMonth]} {selectedYear}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeList.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.id}</TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell>
                            <Badge variant="success">{emp.present}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{emp.absent}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="warning">{emp.late}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${emp.attendanceRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{emp.attendanceRate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewEmployeeDetails(emp)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin View - Employee Details */}
          {isAdmin && activeSection === 'employeeDetails' && selectedEmployee && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedEmployee.name}</h1>
                  <p className="text-gray-500 mt-1">{selectedEmployee.position} • {selectedEmployee.department}</p>
                </div>
                <Button variant="outline" onClick={() => setActiveSection('overview')}>
                  Back to Overview
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Days</p>
                        <p className="text-2xl font-bold">{stats.totalDays}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Present</p>
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Late Arrivals</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeAttendance.map((att) => {
                        const { full, day } = formatDate(att.date)
                        return (
                          <TableRow key={att.id}>
                            <TableCell className="font-medium">{full}</TableCell>
                            <TableCell>{day}</TableCell>
                            <TableCell>
                              {att.checkIn || <span className="text-gray-400">-</span>}
                              {att.isLate && <Badge variant="warning" className="ml-2 text-xs">Late</Badge>}
                            </TableCell>
                            <TableCell>{att.checkOut || <span className="text-gray-400">-</span>}</TableCell>
                            <TableCell>{att.hoursWorked} hrs</TableCell>
                            <TableCell>
                              <Badge variant={att.status === 'present' ? 'success' : 'destructive'} className="capitalize">
                                {att.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
