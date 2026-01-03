import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { employeesApi } from '@/api/employees.api';
import { Employee } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
  }, [id]);

  const fetchEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      const data = await employeesApi.getById(employeeId);
      setEmployee(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch employee details',
        variant: 'destructive',
      });
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employee not found</p>
        <Button onClick={() => navigate('/employees')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/employees')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Employee Information</h1>
          <p className="text-muted-foreground">View employee details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Employee personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={employee.firstName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={employee.lastName} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={employee.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={employee.phone || '-'} disabled />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={employee.department || '-'} disabled />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={employee.position || '-'} disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={employee.role} disabled />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={employee.status} disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input
                value={employee.salary 
                  ? `$${typeof employee.salary === 'number' 
                    ? employee.salary.toLocaleString() 
                    : employee.salary}`
                  : '-'}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Hire Date</Label>
              <Input
                value={employee.hireDate 
                  ? new Date(employee.hireDate).toLocaleDateString()
                  : '-'}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

