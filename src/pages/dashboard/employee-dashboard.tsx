import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Clock, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { payrollApi } from '@/api/payroll.api';
import { CardSkeleton } from '@/components/common/loading-skeleton';
import dayjs from 'dayjs';

export function EmployeeDashboard() {
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [recentPayroll, setRecentPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendance, leaves, payroll] = await Promise.all([
          attendanceApi.getMyAttendance(),
          leavesApi.getMyLeaves(),
          payrollApi.getMyPayroll(),
        ]);
        setAttendanceCount(attendance.length);
        setPendingLeaves(leaves.filter(l => l.status === 'pending').length);
        setRecentPayroll(payroll[0] || null);
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <CardDescription className="flex items-center mt-2">
                Manage your profile
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
              <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <CardDescription className="flex items-center mt-2">
                Pending approvals
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
              <div className="text-2xl font-bold">
                ${recentPayroll ? (recentPayroll.netSalary / 12).toLocaleString() : '0'}
              </div>
              <CardDescription className="flex items-center mt-2">
                Monthly salary
                <ArrowRight className="ml-2 h-4 w-4" />
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Last check-in</p>
                  <p className="text-xs text-muted-foreground">Today at 9:00 AM</p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Leave application</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

