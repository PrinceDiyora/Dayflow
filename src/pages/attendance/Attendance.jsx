import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/authStore'
import { attendanceAPI, leaveAPI } from '@/mocks/api'
import { User, LogOut, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

export function Attendance() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch current employee's data
        const [attendanceRes, leavesRes] = await Promise.all([
          attendanceAPI.getAll(user?.id),
          leaveAPI.getAll(user?.id),
        ])
        setAttendance(attendanceRes.data)
        setLeaves(leavesRes.data)
      } catch (error) {
        console.error('Failed to fetch data', error)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getActiveTab = () => {
    if (location.pathname === '/attendance') return 'attendance'
    if (location.pathname === '/leaves') return 'timeoff'
    return 'employees'
  }
  const activeTab = getActiveTab()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

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
    setCurrentDate(new Date(selectedYear, selectedMonth === 11 ? 0 : selectedMonth + 1, 1))
  }

  useEffect(() => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 22))
  }, [selectedMonth, selectedYear])

  // Filter attendance for selected month
  const filteredAttendance = attendance.filter(att => {
    const attDate = new Date(att.date)
    return attDate.getMonth() === selectedMonth && attDate.getFullYear() === selectedYear
  })

  // Calculate statistics
  const daysPresent = filteredAttendance.filter(att => att.status === 'present').length
  const leavesCount = leaves.filter(leave => {
    const leaveStart = new Date(leave.startDate)
    const leaveEnd = new Date(leave.endDate)
    return leave.status === 'approved' &&
      leaveStart.getMonth() <= selectedMonth &&
      leaveEnd.getMonth() >= selectedMonth &&
      leaveStart.getFullYear() <= selectedYear &&
      leaveEnd.getFullYear() >= selectedYear
  }).length

  // Calculate total working days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }
  const totalWorkingDays = getDaysInMonth(selectedMonth, selectedYear)

  // Calculate work hours and extra hours
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return { workHours: '00:00', extraHours: '00:00' }
    
    const [inHour, inMin] = checkIn.split(':').map(Number)
    const [outHour, outMin] = checkOut.split(':').map(Number)
    
    const inMinutes = inHour * 60 + inMin
    const outMinutes = outHour * 60 + outMin
    const totalMinutes = outMinutes - inMinutes
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    // Assuming 8 hours is standard work hours
    const standardMinutes = 8 * 60
    const extraMinutes = Math.max(0, totalMinutes - standardMinutes)
    const extraHours = Math.floor(extraMinutes / 60)
    const extraMins = extraMinutes % 60
    
    return {
      workHours: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      extraHours: `${String(extraHours).padStart(2, '0')}:${String(extraMins).padStart(2, '0')}`
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatCurrentDate = () => {
    const day = currentDate.getDate()
    const month = monthNames[currentDate.getMonth()]
    const year = currentDate.getFullYear()
    return `${day},${month} ${year}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Title */}
      <div className="pt-4 pb-2 text-center">
        <h1 className="text-2xl font-bold text-black">For Employees</h1>
      </div>

      {/* Top Navigation Bar */}
      <div className="border-b border-black flex items-center justify-between px-6 py-2">
        {/* Left Side: Logo and Navigation */}
        <div className="flex items-center gap-6">
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

        {/* Right Side: Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-8 h-8 bg-blue-200 border border-black"></div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 ml-1">
                <div className="w-0 h-0 border-l-[3px] border-l-blue-300 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div>
                <div className="w-0 h-0 border-l-[3px] border-l-blue-300 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div>
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
      <div className="p-6">
        {/* Attendance Header */}
        <h2 className="text-2xl font-bold text-black mb-4">Attendance</h2>

        {/* Controls Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Navigation Arrows */}
            <Button
              onClick={handlePreviousMonth}
              variant="outline"
              className="border border-black w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleNextMonth}
              variant="outline"
              className="border border-black w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {/* Month Dropdown */}
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-32 border border-black">
                <SelectValue>
                  {monthNames[selectedMonth].substring(0, 3)} v
                </SelectValue>
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

          {/* Statistics Boxes */}
          <div className="flex items-center gap-4">
            <div className="border border-black px-4 py-2 bg-white">
              <span className="text-sm text-black">Count of days present: {daysPresent}</span>
            </div>
            <div className="border border-black px-4 py-2 bg-white">
              <span className="text-sm text-black">Leaves count: {leavesCount}</span>
            </div>
            <div className="border border-black px-4 py-2 bg-white">
              <span className="text-sm text-black">Total working days: {totalWorkingDays}</span>
            </div>
          </div>
        </div>

        {/* Current Date Display */}
        <div className="text-center mb-4">
          <p className="text-lg text-black">{formatCurrentDate()}</p>
        </div>

        {/* Attendance Table */}
        <div className="border border-black">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black">
                <TableHead className="border-r border-black text-black font-medium">Date</TableHead>
                <TableHead className="border-r border-black text-black font-medium">Check In</TableHead>
                <TableHead className="border-r border-black text-black font-medium">Check Out</TableHead>
                <TableHead className="border-r border-black text-black font-medium">Work Hours</TableHead>
                <TableHead className="text-black font-medium">Extra hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-black border-r border-black">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((att) => {
                  const { workHours, extraHours } = calculateHours(att.checkIn, att.checkOut)
                  return (
                    <TableRow key={att.id} className="border-b border-black">
                      <TableCell className="text-black border-r border-black">
                        {formatDate(att.date)}
                      </TableCell>
                      <TableCell className="text-black border-r border-black">
                        {att.checkIn || 'N/A'}
                      </TableCell>
                      <TableCell className="text-black border-r border-black">
                        {att.checkOut || 'N/A'}
                      </TableCell>
                      <TableCell className="text-black border-r border-black">
                        {workHours}
                      </TableCell>
                      <TableCell className="text-black">
                        {extraHours}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
