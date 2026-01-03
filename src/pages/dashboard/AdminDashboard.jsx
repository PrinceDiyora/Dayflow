import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react'
import { employeeAPI, attendanceAPI, leaveAPI } from '@/mocks/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    activeEmployees: 0,
  })
  const [recentEmployees, setRecentEmployees] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
          employeeAPI.getAll(),
          attendanceAPI.getAll(),
          leaveAPI.getAll(),
        ])

        const employees = employeesRes.data
        const today = new Date().toISOString().split('T')[0]
        const todayAttendance = attendanceRes.data.filter(
          att => att.date === today && att.status === 'present'
        )
        const pendingLeaves = leavesRes.data.filter(l => l.status === 'pending')

        setStats({
          totalEmployees: employees.length,
          presentToday: todayAttendance.length,
          pendingLeaves: pendingLeaves.length,
          activeEmployees: employees.filter(e => e.status === 'active').length,
        })

        setRecentEmployees(employees.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      description: `${stats.activeEmployees} active`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: Clock,
      description: 'Checked in today',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      description: 'Awaiting approval',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Attendance Rate',
      value: stats.totalEmployees > 0 
        ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}%`
        : '0%',
      icon: TrendingUp,
      description: 'Today\'s rate',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your organization</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>Recent employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'success' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/profile">View All Employees</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/attendance">
                <Clock className="mr-2 h-4 w-4" />
                View Attendance
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/leaves">
                <Calendar className="mr-2 h-4 w-4" />
                Approve Leaves
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/payroll">
                <TrendingUp className="mr-2 h-4 w-4" />
                Manage Payroll
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

