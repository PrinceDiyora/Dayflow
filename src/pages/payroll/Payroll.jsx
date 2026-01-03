import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { payrollAPI, employeeAPI } from '@/mocks/api'
import { toast } from 'sonner'
import { DollarSign, FileText, Save } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'

export function Payroll() {
  const { user } = useAuthStore()
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedPayroll, setSelectedPayroll] = useState(null)
  const [isPayslipOpen, setIsPayslipOpen] = useState(false)
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      baseSalary: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      conveyanceAllowance: 0,
      specialAllowance: 0,
      providentFund: 0,
      professionalTax: 0,
      incomeTax: 0,
      otherDeductions: 0,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payrollRes, employeesRes] = await Promise.all([
          payrollAPI.getAll(isAdmin ? null : user.id),
          isAdmin ? employeeAPI.getAll() : Promise.resolve({ data: [] }),
        ])

        setPayrolls(payrollRes.data)
        if (isAdmin) {
          setEmployees(employeesRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch payroll data', error)
      }
    }

    fetchData()
  }, [user, isAdmin])

  const handleViewPayslip = (payroll) => {
    setSelectedPayroll(payroll)
    setIsPayslipOpen(true)
  }

  const handleEditSalary = (employee) => {
    setSelectedEmployee(employee)
    reset({
      baseSalary: employee.salary || 0,
      houseRentAllowance: 10000,
      medicalAllowance: 5000,
      conveyanceAllowance: 3000,
      specialAllowance: 2000,
      providentFund: (employee.salary || 0) * 0.12,
      professionalTax: 200,
      incomeTax: (employee.salary || 0) * 0.1,
      otherDeductions: 0,
    })
    setIsSalaryModalOpen(true)
  }

  const baseSalary = watch('baseSalary') || 0
  const houseRentAllowance = watch('houseRentAllowance') || 0
  const medicalAllowance = watch('medicalAllowance') || 0
  const conveyanceAllowance = watch('conveyanceAllowance') || 0
  const specialAllowance = watch('specialAllowance') || 0
  const providentFund = watch('providentFund') || 0
  const professionalTax = watch('professionalTax') || 0
  const incomeTax = watch('incomeTax') || 0
  const otherDeductions = watch('otherDeductions') || 0

  const grossSalary = baseSalary + houseRentAllowance + medicalAllowance + conveyanceAllowance + specialAllowance
  const totalDeductions = providentFund + professionalTax + incomeTax + otherDeductions
  const netSalary = grossSalary - totalDeductions

  const onSubmitSalary = async (data) => {
    if (!selectedEmployee) return

    try {
      await payrollAPI.update(selectedEmployee.id, {
        baseSalary: data.baseSalary,
      })
      toast.success('Salary structure updated successfully!')
      setIsSalaryModalOpen(false)
      setSelectedEmployee(null)
      // Refresh data
      const payrollRes = await payrollAPI.getAll(isAdmin ? null : user.id)
      setPayrolls(payrollRes.data)
    } catch (error) {
      toast.error('Failed to update salary structure')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Manage employee payroll and salary structures' : 'View your payroll information'}
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Salary Management</CardTitle>
            <CardDescription>Edit salary structures for employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {employees.map((employee) => (
                  <Button
                    key={employee.id}
                    variant="outline"
                    onClick={() => handleEditSalary(employee)}
                    className="justify-start"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    {employee.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            {isAdmin ? 'All employee payroll records' : 'Your payroll history'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Month</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground">
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((payroll) => {
                  const employee = isAdmin
                    ? employees.find((emp) => emp.id === payroll.employeeId)
                    : user
                  return (
                    <TableRow key={payroll.id}>
                      {isAdmin && (
                        <TableCell className="font-medium">{employee?.name || 'Unknown'}</TableCell>
                      )}
                      <TableCell>{new Date(payroll.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</TableCell>
                      <TableCell>{formatCurrency(payroll.baseSalary)}</TableCell>
                      <TableCell>{formatCurrency(payroll.netSalary)}</TableCell>
                      <TableCell>
                        <Badge variant={payroll.status === 'paid' ? 'success' : 'warning'}>
                          {payroll.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPayslip(payroll)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payslip Modal */}
      <Dialog open={isPayslipOpen} onOpenChange={setIsPayslipOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payslip</DialogTitle>
            <DialogDescription>
              {selectedPayroll && (
                <>
                  {new Date(selectedPayroll.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Base Salary</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPayroll.baseSalary)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Allowances</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPayroll.allowances)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Deductions</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPayroll.deductions)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Net Salary</Label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedPayroll.netSalary)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Salary Structure Modal (Admin Only) */}
      {isAdmin && (
        <Dialog open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Salary Structure</DialogTitle>
              <DialogDescription>
                {selectedEmployee && `Edit salary structure for ${selectedEmployee.name}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitSalary)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Salary Components</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Basic Salary</Label>
                    <Input
                      type="number"
                      {...register('baseSalary', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>House Rent Allowance</Label>
                    <Input
                      type="number"
                      {...register('houseRentAllowance', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Medical Allowance</Label>
                    <Input
                      type="number"
                      {...register('medicalAllowance', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conveyance Allowance</Label>
                    <Input
                      type="number"
                      {...register('conveyanceAllowance', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Special Allowance</Label>
                    <Input
                      type="number"
                      {...register('specialAllowance', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <Label className="text-muted-foreground">Gross Salary</Label>
                  <p className="text-2xl font-bold">{formatCurrency(grossSalary)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Deductions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Provident Fund</Label>
                    <Input
                      type="number"
                      {...register('providentFund', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Tax</Label>
                    <Input
                      type="number"
                      {...register('professionalTax', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Income Tax</Label>
                    <Input
                      type="number"
                      {...register('incomeTax', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Other Deductions</Label>
                    <Input
                      type="number"
                      {...register('otherDeductions', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <Label className="text-muted-foreground">Total Deductions</Label>
                  <p className="text-xl font-semibold">{formatCurrency(totalDeductions)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary">
                <Label className="text-muted-foreground">Net Salary</Label>
                <p className="text-3xl font-bold text-primary">{formatCurrency(netSalary)}</p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSalaryModalOpen(false)
                    setSelectedEmployee(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

