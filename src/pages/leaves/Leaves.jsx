import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/authStore'
import { leaveAPI, employeeAPI } from '@/mocks/api'
import { toast } from 'sonner'
import { Calendar, Plus, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const leaveSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  type: z.enum(['paid', 'sick', 'unpaid'], {
    required_error: 'Please select a leave type',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

export function Leaves() {
  const { user } = useAuthStore()
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
  })
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [action, setAction] = useState('approve')
  const [comments, setComments] = useState('')

  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      employeeId: user?.id || '',
      type: 'paid',
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesRes, employeesRes] = await Promise.all([
          leaveAPI.getAll(isAdmin ? null : user.id),
          isAdmin ? employeeAPI.getAll() : Promise.resolve({ data: [] }),
        ])

        setLeaves(leavesRes.data)
        if (isAdmin) {
          setEmployees(employeesRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch leaves', error)
      }
    }

    fetchData()
  }, [user, isAdmin])

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateDays(startDate, endDate)
      // Auto-calculate days (could be displayed in UI)
    }
  }, [startDate, endDate])

  const onSubmitLeave = async (data) => {
    try {
      const days = calculateDays(data.startDate, data.endDate)
      const leaveData = {
        ...data,
        days,
        startDate: data.startDate,
        endDate: data.endDate,
      }
      await leaveAPI.create(leaveData)
      toast.success('Leave request submitted successfully!')
      setIsApplyModalOpen(false)
      reset()
      // Refresh leaves
      const leavesRes = await leaveAPI.getAll(isAdmin ? null : user.id)
      setLeaves(leavesRes.data)
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave request')
    }
  }

  const handleApproveReject = async (leaveId, action) => {
    setSelectedLeave(leaves.find((l) => l.id === leaveId))
    setAction(action)
    setIsApprovalModalOpen(true)
  }

  const confirmApproveReject = async () => {
    if (!selectedLeave) return

    try {
      await leaveAPI.updateStatus(
        selectedLeave.id,
        action === 'approve' ? 'approved' : 'rejected',
        comments,
        user.name
      )
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      setIsApprovalModalOpen(false)
      setComments('')
      setSelectedLeave(null)
      // Refresh leaves
      const leavesRes = await leaveAPI.getAll(isAdmin ? null : user.id)
      setLeaves(leavesRes.data)
    } catch (error) {
      toast.error(error.message || `Failed to ${action} leave`)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    }
    const config = variants[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getLeaveTypeLabel = (type) => {
    const types = {
      paid: 'Paid Time Off',
      sick: 'Sick Leave',
      unpaid: 'Unpaid Leave',
    }
    return types[type] || type
  }

  const filteredLeaves = leaves.filter((leave) => {
    if (filters.employeeId && leave.employeeId !== filters.employeeId) return false
    if (filters.status && leave.status !== filters.status) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave & Time-Off</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage employee leave requests' : 'View and apply for leaves'}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setIsApplyModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Apply Time Off
          </Button>
        )}
      </div>

      <Tabs defaultValue="timeoff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
          <TabsTrigger value="attendances">Attendances</TabsTrigger>
          {!isAdmin && <TabsTrigger value="apply">Apply Time Off</TabsTrigger>}
        </TabsList>

        <TabsContent value="timeoff">
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select
                      value={filters.employeeId}
                      onValueChange={(value) => setFilters({ ...filters, employeeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Employees</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                {isAdmin
                  ? 'All employee leave requests'
                  : 'Your leave requests'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead>Employee</TableHead>}
                    <TableHead>Time Off Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 7 : 6}
                        className="text-center text-muted-foreground"
                      >
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <TableRow key={leave.id}>
                        {isAdmin && (
                          <TableCell className="font-medium">{leave.employeeName}</TableCell>
                        )}
                        <TableCell>{getLeaveTypeLabel(leave.type)}</TableCell>
                        <TableCell>{formatDate(leave.startDate)}</TableCell>
                        <TableCell>{formatDate(leave.endDate)}</TableCell>
                        <TableCell>{leave.days}</TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        {isAdmin && leave.status === 'pending' && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleApproveReject(leave.id, 'approve')}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleApproveReject(leave.id, 'reject')}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        {isAdmin && leave.status !== 'pending' && (
                          <TableCell className="text-muted-foreground">-</TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendances">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View attendance in relation to leaves</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Attendance records are available in the Attendance module
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {!isAdmin && (
          <TabsContent value="apply">
            <Card>
              <CardHeader>
                <CardTitle>Apply Time Off Request</CardTitle>
                <CardDescription>Submit a new leave request</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitLeave)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Time Off Type</Label>
                    <Select
                      value={watch('type')}
                      onValueChange={(value) => setValue('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid Time Off</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        {...register('startDate')}
                        className={errors.startDate ? 'border-destructive' : ''}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        {...register('endDate')}
                        className={errors.endDate ? 'border-destructive' : ''}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-destructive">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="space-y-2">
                      <Label>Total Days</Label>
                      <Input
                        value={calculateDays(startDate, endDate)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea
                      placeholder="Enter reason for leave..."
                      {...register('reason')}
                      className={errors.reason ? 'border-destructive' : ''}
                      rows={4}
                    />
                    {errors.reason && (
                      <p className="text-sm text-destructive">{errors.reason.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Apply Time Off Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Time Off Request</DialogTitle>
            <DialogDescription>Submit a new leave request</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitLeave)} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Input value={user?.name || ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Time Off Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid Time Off</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {startDate && endDate && (
              <div className="space-y-2">
                <Label>Total Days</Label>
                <Input
                  value={calculateDays(startDate, endDate)}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter reason for leave..."
                {...register('reason')}
                className={errors.reason ? 'border-destructive' : ''}
                rows={4}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsApplyModalOpen(false)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <>
                  {selectedLeave.employeeName} - {getLeaveTypeLabel(selectedLeave.type)} ({selectedLeave.days} days)
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                placeholder="Enter comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalModalOpen(false)
                setComments('')
                setSelectedLeave(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={confirmApproveReject}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

