import axios from 'axios'
import { mockEmployees, mockAttendance, mockLeaves, mockPayroll } from './data'

// Mock axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 1000,
})

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// TODO: Replace all these with actual API calls when backend is ready

export const authAPI = {
  login: async (email, password, role) => {
    await delay()
    const user = mockEmployees.find(emp => 
      emp.email === email && 
      (role === 'employee' ? emp.role === 'employee' : ['hr', 'admin'].includes(emp.role))
    )
    
    if (user) {
      return {
        data: {
          user,
          token: `mock-token-${user.id}`,
        }
      }
    }
    throw new Error('Invalid credentials')
  },

  signup: async (employeeId, email, password, role, additionalData = {}) => {
    await delay()
    // Check if employee ID already exists
    const existingEmp = mockEmployees.find(emp => emp.id === employeeId)
    if (existingEmp) {
      throw new Error('Employee ID already exists')
    }
    // Check if email already exists
    const existingEmail = mockEmployees.find(emp => emp.email === email)
    if (existingEmail) {
      throw new Error('Email already exists')
    }
    
    const newUser = {
      id: employeeId,
      email,
      role,
      name: additionalData.name || email.split('@')[0],
      department: 'General',
      position: role === 'admin' ? 'Admin Manager' : role === 'hr' ? 'HR Officer' : 'Employee',
      phone: additionalData.phone || '',
      address: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeId}`,
      joinDate: new Date().toISOString().split('T')[0],
      salary: role === 'admin' ? 95000 : role === 'hr' ? 85000 : 50000,
      status: 'active',
      emailVerified: false, // Email verification flag
    }
    mockEmployees.push(newUser)
    return {
      data: {
        user: newUser,
        token: `mock-token-${employeeId}`,
      }
    }
  },
}

export const employeeAPI = {
  getAll: async () => {
    await delay()
    return { data: mockEmployees }
  },

  getById: async (id) => {
    await delay()
    const employee = mockEmployees.find(emp => emp.id === id)
    if (!employee) throw new Error('Employee not found')
    return { data: employee }
  },

  update: async (id, data) => {
    await delay()
    const index = mockEmployees.findIndex(emp => emp.id === id)
    if (index === -1) throw new Error('Employee not found')
    mockEmployees[index] = { ...mockEmployees[index], ...data }
    return { data: mockEmployees[index] }
  },
}

export const attendanceAPI = {
  getAll: async (employeeId = null) => {
    await delay()
    let data = mockAttendance
    if (employeeId) {
      data = mockAttendance.filter(att => att.employeeId === employeeId)
    }
    return { data }
  },

  checkIn: async (employeeId) => {
    await delay()
    const today = new Date().toISOString().split('T')[0]
    const existing = mockAttendance.find(
      att => att.employeeId === employeeId && att.date === today
    )
    
    if (existing) {
      throw new Error('Already checked in today')
    }

    const newAttendance = {
      id: `ATT${Date.now()}`,
      employeeId,
      date: today,
      checkIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      status: 'present',
      hours: 0,
    }
    mockAttendance.push(newAttendance)
    return { data: newAttendance }
  },

  checkOut: async (employeeId) => {
    await delay()
    const today = new Date().toISOString().split('T')[0]
    const attendance = mockAttendance.find(
      att => att.employeeId === employeeId && att.date === today && att.checkOut === null
    )
    
    if (!attendance) {
      throw new Error('No check-in found for today')
    }

    const checkOutTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    attendance.checkOut = checkOutTime
    
    // Calculate hours
    const checkIn = new Date(`${today}T${attendance.checkIn}`)
    const checkOut = new Date(`${today}T${checkOutTime}`)
    attendance.hours = (checkOut - checkIn) / (1000 * 60 * 60)
    
    return { data: attendance }
  },
}

export const leaveAPI = {
  getAll: async (employeeId = null) => {
    await delay()
    let data = mockLeaves
    if (employeeId) {
      data = mockLeaves.filter(leave => leave.employeeId === employeeId)
    }
    return { data }
  },

  create: async (leaveData) => {
    await delay()
    const employee = mockEmployees.find(emp => emp.id === leaveData.employeeId)
    const newLeave = {
      id: `LEAVE${Date.now()}`,
      ...leaveData,
      employeeName: employee?.name || 'Unknown',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
      comments: null,
    }
    mockLeaves.push(newLeave)
    return { data: newLeave }
  },

  updateStatus: async (leaveId, status, comments, approvedBy) => {
    await delay()
    const leave = mockLeaves.find(l => l.id === leaveId)
    if (!leave) throw new Error('Leave not found')
    leave.status = status
    leave.comments = comments
    leave.approvedBy = approvedBy
    return { data: leave }
  },
}

export const payrollAPI = {
  getAll: async (employeeId = null) => {
    await delay()
    let data = mockPayroll
    if (employeeId) {
      data = mockPayroll.filter(pay => pay.employeeId === employeeId)
    }
    return { data }
  },

  getById: async (id) => {
    await delay()
    const payroll = mockPayroll.find(pay => pay.id === id)
    if (!payroll) throw new Error('Payroll not found')
    return { data: payroll }
  },

  update: async (employeeId, salaryData) => {
    await delay()
    const employee = mockEmployees.find(emp => emp.id === employeeId)
    if (!employee) throw new Error('Employee not found')
    employee.salary = salaryData.baseSalary
    return { data: employee }
  },
}

export default api

