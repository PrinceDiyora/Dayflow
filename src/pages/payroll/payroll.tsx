import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { payrollApi } from '@/api/payroll.api';
import { authStore } from '@/store/auth.store';
import { Payroll } from '@/types';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Loader2 } from 'lucide-react';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import dayjs from 'dayjs';

export function PayrollPage() {
  const { user } = authStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const data = isAdmin ? await payrollApi.getAllPayroll() : await payrollApi.getMyPayroll();
      setPayroll(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payroll',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Manage employee payroll' : 'View your payroll information'}
        </p>
      </div>

      {!isAdmin && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payroll[0] ? (payroll[0].netSalary / 12).toLocaleString() : '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Annual Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payroll[0] ? payroll[0].netSalary.toLocaleString() : '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payroll[0] ? `${payroll[0].month} ${payroll[0].year}` : '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>
            {isAdmin ? 'All payroll records' : 'Your payroll records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 8 : 7}
                    className="text-center text-muted-foreground"
                  >
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                payroll.map((record) => (
                  <TableRow key={record.id}>
                    {isAdmin && <TableCell>{record.employeeName}</TableCell>}
                    <TableCell>{record.month}</TableCell>
                    <TableCell>{record.year}</TableCell>
                    <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>${record.allowances.toLocaleString()}</TableCell>
                    <TableCell>${record.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">
                      ${record.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'processed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
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

