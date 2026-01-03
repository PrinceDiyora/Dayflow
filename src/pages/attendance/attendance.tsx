import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { attendanceApi } from '@/api/attendance.api';
import { authStore } from '@/store/auth.store';
import { Attendance } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import dayjs from 'dayjs';

// Helper function to safely format hours
const formatHours = (hours: number | string | null | undefined): string => {
  if (hours == null) return '-';
  const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  if (isNaN(numHours)) return '-';
  return numHours.toFixed(2);
};

export function AttendancePage() {
  const { user } = authStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    fetchAttendance();
    if (!isAdmin) {
      fetchTodayAttendance();
    }
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await attendanceApi.getAllAttendance()
        : await attendanceApi.getMyAttendance();
      setAttendance(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const data = await attendanceApi.getTodayAttendance();
      setTodayAttendance(data);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setIsChecking(true);
    try {
      await attendanceApi.checkIn();
      toast({
        title: 'Checked in',
        description: 'You have successfully checked in.',
      });
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setIsChecking(true);
    try {
      await attendanceApi.checkOut();
      toast({
        title: 'Checked out',
        description: 'You have successfully checked out.',
      });
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: Attendance['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'half-day':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'leave':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'View all employee attendance' : 'Track your daily attendance'}
        </p>
      </div>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>Check in and check out for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {todayAttendance?.checkIn ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Checked in at</p>
                    <p className="text-2xl font-bold">{todayAttendance.checkIn}</p>
                    {todayAttendance.checkOut && (
                      <>
                        <p className="text-sm text-muted-foreground mt-4">Checked out at</p>
                        <p className="text-2xl font-bold">{todayAttendance.checkOut}</p>
                        <p className="text-sm text-muted-foreground mt-4">Total hours</p>
                        <p className="text-xl font-semibold">
                          {formatHours(todayAttendance.totalHours)} hours
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No check-in recorded for today</p>
                )}
              </div>
              <div className="flex gap-2">
                {!todayAttendance?.checkIn ? (
                  <Button onClick={handleCheckIn} disabled={isChecking}>
                    <Clock className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                ) : !todayAttendance?.checkOut ? (
                  <Button onClick={handleCheckOut} disabled={isChecking}>
                    <Clock className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                ) : (
                  <Button disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            {isAdmin ? 'All employee attendance records' : 'Your attendance records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    {isAdmin && <TableCell>{record.userId}</TableCell>}
                    <TableCell>{dayjs(record.date).format('MMM DD, YYYY')}</TableCell>
                    <TableCell>{record.checkIn || '-'}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>{formatHours(record.totalHours)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className="capitalize">{record.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

