import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/store/authStore'
import { employeeAPI } from '@/mocks/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Camera, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'react-router-dom'

export function Profile() {
  const { user, updateUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const employeeId = searchParams.get('employeeId')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [employee, setEmployee] = useState(user)

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      department: '',
      position: '',
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
    const fetchEmployee = async () => {
      const id = employeeId || user?.id
      if (id) {
        try {
          const response = await employeeAPI.getById(id)
          setEmployee(response.data)
          reset({
            ...response.data,
            baseSalary: response.data.salary || 0,
            houseRentAllowance: 10000,
            medicalAllowance: 5000,
            conveyanceAllowance: 3000,
            specialAllowance: 2000,
            providentFund: (response.data.salary || 0) * 0.12,
            professionalTax: 200,
            incomeTax: (response.data.salary || 0) * 0.1,
            otherDeductions: 0,
          })
        } catch (error) {
          console.error('Failed to fetch employee', error)
        }
      }
    }
    fetchEmployee()
  }, [user, employeeId, reset])

  const canEdit = user?.role === 'admin' || user?.role === 'hr' || !employeeId
  const isAdmin = user?.role === 'admin'
  const isViewingOther = employeeId && employeeId !== user?.id

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const id = employeeId || user.id
      const response = await employeeAPI.update(id, data)
      setEmployee(response.data)
      if (!employeeId) {
        updateUser(response.data)
      }
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isViewingOther ? 'Employee Profile' : 'My Profile'}</h1>
          <p className="text-muted-foreground">Manage profile information</p>
        </div>
        {!isEditing && canEdit && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee?.avatar} alt={employee?.name} />
                <AvatarFallback className="text-2xl">{getInitials(employee?.name)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{employee?.name || 'My Name'}</h2>
              <p className="text-muted-foreground">Employee ID: {employee?.id || 'N/A'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">{employee?.role}</Badge>
                <Badge variant={employee?.status === 'active' ? 'success' : 'secondary'}>
                  {employee?.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="job">Job Info</TabsTrigger>
          {isAdmin && <TabsTrigger value="salary">Salary Info</TabsTrigger>}
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={watch('gender')}
                      onValueChange={(value) => setValue('gender', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select
                      value={watch('maritalStatus')}
                      onValueChange={(value) => setValue('maritalStatus', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        reset(employee)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Your employment details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input value={employee?.id || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={watch('department')}
                      {...register('department')}
                      disabled={!isEditing || !canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={watch('position')}
                      {...register('position')}
                      disabled={!isEditing || !canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <Input value={employee?.joinDate ? formatDate(employee.joinDate) : ''} disabled />
                  </div>
                </div>
                {isEditing && canEdit && (
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        reset(employee)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle>Salary Structure</CardTitle>
                <CardDescription>
                  {isViewingOther ? 'Employee salary details (Admin only)' : 'Your salary structure (Admin only)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Salary Components</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Basic Salary</Label>
                        <Input
                          type="number"
                          {...register('baseSalary', { valueAsNumber: true })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>House Rent Allowance</Label>
                        <Input
                          type="number"
                          {...register('houseRentAllowance', { valueAsNumber: true })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Medical Allowance</Label>
                        <Input
                          type="number"
                          {...register('medicalAllowance', { valueAsNumber: true })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conveyance Allowance</Label>
                        <Input
                          type="number"
                          {...register('conveyanceAllowance', { valueAsNumber: true })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Special Allowance</Label>
                        <Input
                          type="number"
                          {...register('specialAllowance', { valueAsNumber: true })}
                          disabled={!isEditing}
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
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Tax</Label>
                        <Input
                          type="number"
                          {...register('professionalTax', { valueAsNumber: true })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Income Tax</Label>
                        <Input
                          type="number"
                          {...register('incomeTax', { valueAsNumber: true })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Other Deductions</Label>
                        <Input
                          type="number"
                          {...register('otherDeductions', { valueAsNumber: true })}
                          disabled={!isEditing}
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

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          reset(employee)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No documents uploaded yet</p>
                <Button variant="outline" className="mt-4">
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
