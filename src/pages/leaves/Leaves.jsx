import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { toast } from 'sonner'
import { 
  Calendar, Plus, CheckCircle2, XCircle, AlertCircle, 
  FileText, Clock, User as UserIcon
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const leaveSchema = z.object({
  type: z.enum(['paid', 'sick', 'unpaid'], {
    required_error: 'Please select a leave type',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

// Generate dummy leave data
const generateDummyLeaves = (userId, userName, userDepartment, isAdmin) => {
  const leaveTypes = ['paid', 'sick', 'unpaid']
  const statuses = ['approved', 'pending', 'rejected']
  const reasons = [
    'Family vacation planned for long time',
    'Medical appointment with specialist',
    'Personal emergency - family matter',
    'Attending wedding ceremony',
    'Home renovation work',
    'Religious festival celebration',
    'Child care responsibilities',
    'Medical treatment required',
  ]
  
  const employeeNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams',
    'David Brown', 'Emily Davis', 'Robert Wilson', 'Lisa Anderson'
  ]
  
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
  
  const leaves = []
  const numLeaves = isAdmin ? 20 : 12
  
  for (let i = 0; i < numLeaves; i++) {
    const appliedDate = new Date()
    appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 90))
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 120) - 60)
    
    const duration = Math.floor(Math.random() * 5) + 1
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration - 1)
    
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const empName = isAdmin ? employeeNames[Math.floor(Math.random() * employeeNames.length)] : userName
    const empDept = isAdmin ? departments[Math.floor(Math.random() * departments.length)] : userDepartment
    const empId = isAdmin ? `EMP00${Math.floor(Math.random() * 8) + 1}` : userId
    
    leaves.push({
      id: `LR${String(i + 1).padStart(3, '0')}`,
      employeeId: empId,
      employeeName: empName || 'John Doe',
      department: empDept || 'Engineering',
      type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status,
      appliedDate: appliedDate.toISOString(),
      approvedBy: status === 'approved' ? 'HR Manager' : null,
      comments: status === 'rejected' ? 'Already too many leaves in this period' : status === 'approved' ? 'Approved by manager' : null,
    })
  }
  
  return leaves.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
}

export function Leaves() {
  const { user } = useAuthStore()
  const [leaves, setLeaves] = useState([])
  const [activeSection, setActiveSection] = useState('pending')
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
      type: 'paid',
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  useEffect(() => {
    const dummyLeaves = generateDummyLeaves(
      user?._id || user?.id,
      user?.name,
      user?.department,
      isAdmin
    )
    setLeaves(dummyLeaves)
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

  const onSubmitLeave = async (data) => {
    try {
      const days = calculateDays(data.startDate, data.endDate)
      const newLeave = {
        id: `LR${String(leaves.length + 1).padStart(3, '0')}`,
        employeeId: user?._id || user?.id,
        employeeName: user?.name || 'John Doe',
        department: user?.department || 'Engineering',
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        duration: days,
        reason: data.reason,
        status: 'pending',
        appliedDate: new Date().toISOString(),
        approvedBy: null,
        comments: null,
      }
      
      setLeaves([newLeave, ...leaves])
      toast.success('Leave request submitted successfully!')
      setIsApplyModalOpen(false)
      reset()
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave request')
    }
  }

  const handleApproveReject = async (leave, actionType) => {
    setSelectedLeave(leave)
    setAction(actionType)
    setIsApprovalModalOpen(true)
  }

  const confirmApproveReject = async () => {
    if (!selectedLeave) return

    try {
      const updatedLeaves = leaves.map(leave => 
        leave.id === selectedLeave.id
          ? {
              ...leave,
              status: action === 'approve' ? 'approved' : 'rejected',
              approvedBy: user?.name || 'HR Manager',
              comments: comments || (action === 'approve' ? 'Approved by manager' : 'Request declined'),
            }
          : leave
      )
      
      setLeaves(updatedLeaves)
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      setIsApprovalModalOpen(false)
      setComments('')
      setSelectedLeave(null)
    } catch (error) {
      toast.error(error.message || `Failed to ${action} leave`)
    }
  }

  const getLeaveTypeLabel = (type) => {
    const types = {
      paid: 'Paid Time Off',
      sick: 'Sick Leave',
      unpaid: 'Unpaid Leave',
    }
    return types[type] || type
  }

  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const pendingLeaves = leaves.filter(l => l.status === 'pending')
  const approvedLeaves = leaves.filter(l => l.status === 'approved')
  const rejectedLeaves = leaves.filter(l => l.status === 'rejected')

  const sidebarItems = [
    { id: 'pending', label: 'Pending Requests', icon: AlertCircle, count: pendingLeaves.length, color: 'text-yellow-600' },
    { id: 'approved', label: 'Approved Leaves', icon: CheckCircle2, count: approvedLeaves.length, color: 'text-green-600' },
    { id: 'rejected', label: 'Rejected Requests', icon: XCircle, count: rejectedLeaves.length, color: 'text-red-600' },
  ]

  const renderLeaveCard = (leave) => (
    <div key={leave.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{leave.id}</h3>
            <Badge variant={
              leave.type === 'paid' ? 'default' : 
              leave.type === 'sick' ? 'secondary' : 
              'outline'
            } className="text-xs">
              {getLeaveTypeLabel(leave.type)}
            </Badge>
            {isAdmin && (
              <span className="text-sm text-gray-600">• {leave.employeeName}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{leave.reason}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-1">Start Date</p>
          <p className="font-medium text-gray-900">{formatDateShort(leave.startDate)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">End Date</p>
          <p className="font-medium text-gray-900">{formatDateShort(leave.endDate)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Duration</p>
          <p className="font-medium text-gray-900">{leave.duration} day(s)</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Applied On</p>
          <p className="font-medium text-gray-900">{formatDateShort(leave.appliedDate)}</p>
        </div>
      </div>

      {leave.comments && (
        <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Comments</p>
          <p className="text-sm text-gray-700">{leave.comments}</p>
        </div>
      )}

      {leave.approvedBy && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            {leave.status === 'approved' ? 'Approved' : 'Rejected'} by: <span className="font-medium text-gray-700">{leave.approvedBy}</span>
          </p>
        </div>
      )}

      {isAdmin && leave.status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => handleApproveReject(leave, 'approve')}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleApproveReject(leave, 'reject')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Leave Requests</h3>
              <p className="text-xs text-gray-500">{isAdmin ? 'Admin View' : 'Employee View'}</p>
            </div>
          </div>
        </div>

        {/* Apply Leave Button */}
        {!isAdmin && (
          <div className="p-4 border-b border-gray-200">
            <Button onClick={() => setIsApplyModalOpen(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                  {item.label}
                </div>
                <Badge 
                  variant={isActive ? 'secondary' : 'outline'} 
                  className="text-xs"
                >
                  {item.count}
                </Badge>
              </button>
            )
          })}
        </nav>

        {/* Summary Stats */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="text-xs font-semibold text-gray-500 mb-3">SUMMARY</div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Requests</span>
            <Badge variant="outline" className="text-xs">{leaves.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Pending</span>
            <Badge variant="warning" className="text-xs">{pendingLeaves.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Approved</span>
            <Badge variant="success" className="text-xs">{approvedLeaves.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Rejected</span>
            <Badge variant="destructive" className="text-xs">{rejectedLeaves.length}</Badge>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Pending Requests */}
          {activeSection === 'pending' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Pending Leave Requests</h1>
                <p className="text-gray-500 mt-1">
                  {isAdmin 
                    ? `${pendingLeaves.length} leave requests awaiting approval` 
                    : `You have ${pendingLeaves.length} pending leave request(s)`
                  }
                </p>
              </div>

              {pendingLeaves.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No pending leave requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingLeaves.map(renderLeaveCard)}
                </div>
              )}
            </>
          )}

          {/* Approved Leaves */}
          {activeSection === 'approved' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Approved Leaves</h1>
                <p className="text-gray-500 mt-1">
                  {approvedLeaves.length} approved leave request(s)
                </p>
              </div>

              {approvedLeaves.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No approved leave requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {approvedLeaves.map(renderLeaveCard)}
                </div>
              )}
            </>
          )}

          {/* Rejected Requests */}
          {activeSection === 'rejected' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Rejected Leave Requests</h1>
                <p className="text-gray-500 mt-1">
                  {rejectedLeaves.length} rejected leave request(s)
                </p>
              </div>

              {rejectedLeaves.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No rejected leave requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rejectedLeaves.map(renderLeaveCard)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Submit a new leave request for approval</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitLeave)} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Input value={user?.name || ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Leave Type</Label>
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
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Total Duration</p>
                    <p className="text-lg font-bold text-blue-600">{calculateDays(startDate, endDate)} day(s)</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason for Leave</Label>
              <Textarea
                placeholder="Please provide a detailed reason for your leave request..."
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
              <Button type="submit">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold">{selectedLeave.employeeName}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getLeaveTypeLabel(selectedLeave.type)} • {selectedLeave.duration} day(s)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateShort(selectedLeave.startDate)} → {formatDateShort(selectedLeave.endDate)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea
                placeholder="Add any comments or notes..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
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
              {action === 'approve' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Leave
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Leave
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
