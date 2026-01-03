import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { authStore } from '@/store/auth.store';
import { Attendance } from '@/types';
import { Leave } from '@/types';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import dayjs from 'dayjs';

// Extended Attendance type with user info
interface AttendanceWithUser extends Attendance {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Helper to format time in HH:mm format
const formatTime = (time?: string): string => {
  if (!time) return '-';
  return time;
};

// Calculate work hours (assuming 8 hours standard)
const calculateWorkHours = (checkIn?: string, checkOut?: string): string => {
  if (!checkIn || !checkOut) return '-';
  const [inHour, inMin] = checkIn.split(':').map(Number);
  const [outHour, outMin] = checkOut.split(':').map(Number);
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  const totalMinutes = outMinutes - inMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate extra hours (hours beyond 8 hours)
const calculateExtraHours = (checkIn?: string, checkOut?: string): string => {
  if (!checkIn || !checkOut) return '-';
  const [inHour, inMin] = checkIn.split(':').map(Number);
  const [outHour, outMin] = checkOut.split(':').map(Number);
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  const totalMinutes = outMinutes - inMinutes;
  const standardMinutes = 8 * 60; // 8 hours in minutes
  const extraMinutes = totalMinutes - standardMinutes;
  
  if (extraMinutes <= 0) return '00:00';
  
  const hours = Math.floor(extraMinutes / 60);
  const minutes = extraMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export function AttendancePage() {
  const { user } = authStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  // State for Admin/HR
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Employees
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  
  const [attendance, setAttendance] = useState<AttendanceWithUser[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceWithUser[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
    if (!isAdmin) {
      fetchLeaves();
    }
  }, [isAdmin, selectedDate, selectedMonth]);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchQuery, selectedDate, selectedMonth, isAdmin]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await attendanceApi.getAllAttendance()
        : await attendanceApi.getMyAttendance();
      
      // Type assertion for user info
      setAttendance(data as AttendanceWithUser[]);
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

  const fetchLeaves = async () => {
    try {
      const data = await leavesApi.getMyLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    if (isAdmin) {
      // Filter by selected date
      const dateStr = selectedDate.format('YYYY-MM-DD');
      filtered = filtered.filter((record) => record.date === dateStr);
      
      // Filter by search query (employee name)
      if (searchQuery) {
        filtered = filtered.filter((record) => {
          const userName = record.user
            ? `${record.user.firstName} ${record.user.lastName}`.toLowerCase()
            : '';
          return userName.includes(searchQuery.toLowerCase());
        });
      }
    } else {
      // Filter by selected month
      filtered = filtered.filter((record) => {
        const recordDate = dayjs(record.date);
        return (
          recordDate.month() === selectedMonth.month() &&
          recordDate.year() === selectedMonth.year()
        );
      });
    }

    setFilteredAttendance(filtered);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (isAdmin) {
      setSelectedDate((prev) => prev.add(direction === 'next' ? 1 : -1, 'day'));
    } else {
      setSelectedMonth((prev) => prev.add(direction === 'next' ? 1 : -1, 'month'));
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dayjs(dateStr));
  };

  const handleMonthSelect = (month: string) => {
    const [year, monthNum] = month.split('-');
    setSelectedMonth(dayjs(`${year}-${monthNum}-01`));
  };

  // Calculate summary for employees
  const getSummary = () => {
    if (isAdmin) return null;

    const presentDays = filteredAttendance.filter(
      (record) => record.status === 'present' && record.checkIn
    ).length;

    const approvedLeaves = leaves.filter(
      (leave) =>
        leave.status === 'approved' &&
        dayjs(leave.startDate).month() === selectedMonth.month() &&
        dayjs(leave.startDate).year() === selectedMonth.year()
    );
    const leaveCount = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

    // Calculate total working days in the month
    const daysInMonth = selectedMonth.daysInMonth();
    const totalWorkingDays = daysInMonth; // Simplified - could exclude weekends

    return {
      presentDays,
      leaveCount,
      totalWorkingDays,
    };
  };

  const summary = getSummary();

  // Generate date options for dropdown (last 30 days)
  const getDateOptions = () => {
    const options = [];
    for (let i = 0; i < 30; i++) {
      const date = dayjs().subtract(i, 'day');
      options.push({
        value: date.format('YYYY-MM-DD'),
        label: date.format('DD, MMMM YYYY'),
      });
    }
    return options;
  };

  // Generate month options
  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const month = dayjs().subtract(i, 'month');
      options.push({
        value: month.format('YYYY-MM'),
        label: month.format('MMMM YYYY'),
      });
    }
    return options;
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        {isAdmin && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Searchbar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Date/Month Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDateChange('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDateChange('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {isAdmin ? (
          <>
            <Select
              value={selectedDate.format('YYYY-MM-DD')}
              onValueChange={handleDateSelect}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {getDateOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">Day</Button>
          </>
        ) : (
          <Select
            value={selectedMonth.format('YYYY-MM')}
            onValueChange={handleMonthSelect}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Current Date Display */}
      <div className="text-muted-foreground">
        {isAdmin
          ? selectedDate.format('DD, MMMM YYYY')
          : selectedMonth.format('DD, MMMM YYYY')}
      </div>

      {/* Summary Boxes for Employees */}
      {!isAdmin && summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Count of days present</div>
              <div className="text-2xl font-bold">{summary.presentDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Leaves count</div>
              <div className="text-2xl font-bold">{summary.leaveCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total working days</div>
              <div className="text-2xl font-bold">{summary.totalWorkingDays}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin ? (
                  <>
                    <TableHead>Emp</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Extra hours</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Extra hours</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 5 : 5}
                    className="text-center text-muted-foreground"
                  >
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    {isAdmin ? (
                      <TableCell>
                        {record.user
                          ? `${record.user.firstName} ${record.user.lastName}`
                          : record.userId}
                      </TableCell>
                    ) : (
                      <TableCell>
                        {dayjs(record.date).format('DD/MM/YYYY')}
                      </TableCell>
                    )}
                    <TableCell>{formatTime(record.checkIn)}</TableCell>
                    <TableCell>{formatTime(record.checkOut)}</TableCell>
                    <TableCell>
                      {calculateWorkHours(record.checkIn, record.checkOut)}
                    </TableCell>
                    <TableCell>
                      {calculateExtraHours(record.checkIn, record.checkOut)}
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
