import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { employeesApi } from '@/api/employees.api';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { payrollApi } from '@/api/payroll.api';
import { CardSkeleton } from '@/components/common/loading-skeleton';

export function AdminDashboard() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [payrollTotal, setPayrollTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employees, attendance, leaves, payroll] = await Promise.all([
          employeesApi.getAll(),
          attendanceApi.getAllAttendance(),
          leavesApi.getAllLeaves(),
          payrollApi.getAllPayroll(),
        ]);
        setEmployeeCount(employees.length);
        setAttendanceCount(attendance.length);
        setPendingLeaves(leaves.filter(l => l.status === 'pending').length);
        setPayrollTotal(payroll.reduce((sum, p) => sum + p.netSalary, 0));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your HRMS system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeeCount}</div>
              <CardDescription className="flex items-center mt-2">
                Total employees
                <ArrowRight className="ml-2 h-4 w-4" />
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/attendance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceCount}</div>
              <CardDescription className="flex items-center mt-2">
                Records this month
                <ArrowRight className="ml-2 h-4 w-4" />
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/leaves">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <CardDescription className="flex items-center mt-2">
                Awaiting approval
                <ArrowRight className="ml-2 h-4 w-4" />
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/payroll">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(payrollTotal / 1000).toFixed(0)}k</div>
              <CardDescription className="flex items-center mt-2">
                Total payroll
                <ArrowRight className="ml-2 h-4 w-4" />
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/employees" className="block text-sm hover:text-primary">
                → Add new employee
              </Link>
              <Link to="/leaves" className="block text-sm hover:text-primary">
                → Review leave requests
              </Link>
              <Link to="/payroll" className="block text-sm hover:text-primary">
                → Process payroll
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

