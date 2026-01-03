import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { employeesApi } from '@/api/employees.api';
import { attendanceApi } from '@/api/attendance.api';
import { leavesApi } from '@/api/leaves.api';
import { Employee } from '@/types';
import { Attendance } from '@/types';
import { Leave } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Loader2, Circle, Plane, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authStore } from '@/store/auth.store';
import dayjs from 'dayjs';

const employeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  phone: z.string().min(1, 'Phone is required'),
  salary: z.number().min(0, 'Salary must be positive'),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

type EmployeeStatus = 'present' | 'leave' | 'absent';

interface EmployeeWithStatus extends Employee {
  status: EmployeeStatus;
}

export function EmployeesPage() {
  const { user } = authStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [leavesData, setLeavesData] = useState<Leave[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    fetchEmployees();
    // Try to fetch attendance and leaves for status indicators
    // If user doesn't have permission, status will default to 'absent'
    fetchAttendance().catch(() => {
      // Silently fail if user doesn't have permission
    });
    fetchLeaves().catch(() => {
      // Silently fail if user doesn't have permission
    });
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      const employeesWithStatus = employees.map((emp) => {
        const status = getEmployeeStatus(emp.id);
        return { ...emp, status };
      });
      setFilteredEmployees(employeesWithStatus);
    }
  }, [employees, attendanceData, leavesData, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = employees
        .map((emp) => {
          const status = getEmployeeStatus(emp.id);
          return { ...emp, status };
        })
        .filter(
          (emp) =>
            emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      setFilteredEmployees(filtered);
    } else {
      const employeesWithStatus = employees.map((emp) => {
        const status = getEmployeeStatus(emp.id);
        return { ...emp, status };
      });
      setFilteredEmployees(employeesWithStatus);
    }
  }, [searchQuery, employees, attendanceData, leavesData]);

  const getEmployeeStatus = (employeeId: string): EmployeeStatus => {
    const today = dayjs().format('YYYY-MM-DD');
    
    // Check if employee is on leave today
    const todayLeave = leavesData.find((leave) => {
      if (leave.status !== 'approved') return false;
      const startDate = dayjs(leave.startDate).format('YYYY-MM-DD');
      const endDate = dayjs(leave.endDate).format('YYYY-MM-DD');
      return today >= startDate && today <= endDate && leave.userId === employeeId;
    });
    
    if (todayLeave) {
      return 'leave';
    }
    
    // Check attendance for today
    const todayAttendance = attendanceData.find(
      (att) => att.userId === employeeId && att.date === today
    );
    
    if (todayAttendance) {
      if (todayAttendance.status === 'present' && todayAttendance.checkIn) {
        return 'present';
      } else if (todayAttendance.status === 'absent') {
        return 'absent';
      }
    }
    
    // If no attendance record and no leave, assume absent
    return 'absent';
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const data = await attendanceApi.getAllAttendance();
      setAttendanceData(data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const data = await leavesApi.getAllLeaves();
      setLeavesData(data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const onSubmit = async (data: EmployeeForm) => {
    setIsSubmitting(true);
    try {
      await employeesApi.create({
        ...data,
        role: 'employee',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
      toast({
        title: 'Success',
        description: 'Employee added successfully',
      });
      setIsDialogOpen(false);
      reset();
      fetchEmployees();
      if (isAdmin) {
        fetchAttendance();
        fetchLeaves();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add employee',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: EmployeeStatus) => {
    switch (status) {
      case 'present':
        return <Circle className="h-4 w-4 text-green-500 fill-green-500" />;
      case 'leave':
        return <Plane className="h-4 w-4 text-blue-500" />;
      case 'absent':
        return <Circle className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCardClick = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen flex flex-col">
      {/* Header with NEW button and Search */}
      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {isAdmin && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                NEW
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter the employee's information below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" {...register('department')} />
                  {errors.department && (
                    <p className="text-sm text-destructive">{errors.department.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" {...register('position')} />
                  {errors.position && (
                    <p className="text-sm text-destructive">{errors.position.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    {...register('salary', { valueAsNumber: true })}
                  />
                  {errors.salary && (
                    <p className="text-sm text-destructive">{errors.salary.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Employee
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No employees found
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <Card
              key={employee.id}
              className="cursor-pointer hover:shadow-lg transition-shadow relative"
              onClick={() => handleCardClick(employee.id)}
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                {getStatusIcon(employee.status)}
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Profile Picture Placeholder */}
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </span>
                  </div>
                  
                  {/* Employee Name */}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    {employee.position && (
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    )}
                    {employee.department && (
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Settings Link at Bottom */}
      {isAdmin && (
        <div className="mt-auto pt-6 border-t">
          <Button variant="link" onClick={() => navigate('/settings')} className="p-0 h-auto">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      )}
    </div>
  );
}
