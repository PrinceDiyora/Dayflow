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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { payslipsApi } from '@/api/payslips.api';
import { Payslip } from '@/types';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import dayjs from 'dayjs';

export function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const data = await payslipsApi.getMyPayslips();
      setPayslips(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payslips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const payslip = await payslipsApi.getPayslipById(id);
      setSelectedPayslip(payslip);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payslip',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const blob = await payslipsApi.downloadPayslip(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: 'Payslip downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download payslip',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payslips</h1>
        <p className="text-muted-foreground">View and download your payslips</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>Your payslip records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No payslips found
                  </TableCell>
                </TableRow>
              ) : (
                payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>{payslip.month}</TableCell>
                    <TableCell>{payslip.year}</TableCell>
                    <TableCell>${payslip.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>${payslip.allowances.toLocaleString()}</TableCell>
                    <TableCell>${payslip.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">
                      ${payslip.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {dayjs(payslip.generatedAt).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(payslip.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(payslip.id)}
                          disabled={downloadingId === payslip.id}
                        >
                          {downloadingId === payslip.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
            <DialogDescription>
              {selectedPayslip &&
                `${selectedPayslip.month} ${selectedPayslip.year} Payslip`}
            </DialogDescription>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Month</p>
                  <p className="font-semibold">{selectedPayslip.month}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold">{selectedPayslip.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="font-semibold">${selectedPayslip.baseSalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allowances</p>
                  <p className="font-semibold">${selectedPayslip.allowances.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deductions</p>
                  <p className="font-semibold">${selectedPayslip.deductions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Salary</p>
                  <p className="font-semibold text-lg">
                    ${selectedPayslip.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleDownload(selectedPayslip.id)}
                  disabled={downloadingId === selectedPayslip.id}
                >
                  {downloadingId === selectedPayslip.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

