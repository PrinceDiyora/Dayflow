import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/authStore'
import { employeeAPI } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Camera, Save, User, Briefcase, DollarSign, FileText, Edit2, X, 
  Phone, Mail, MapPin, Calendar, UserCircle, Upload
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'react-router-dom'

export function Profile() {
  const { user, updateUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const employeeId = searchParams.get('employeeId')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [employee, setEmployee] = useState(user)
  const [profileImage, setProfileImage] = useState(null)

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
      joiningDate: '',
      employmentType: '',
      baseSalary: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      conveyanceAllowance: 0,
      specialAllowance: 0,
      providentFund: 0,
      professionalTax: 0,
      incomeTax: 0,
      otherDeductions: 0,
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    },
  })

  useEffect(() => {
    const fetchEmployee = async () => {
      const id = employeeId || user?._id || user?.id
      
      if (!id) {
        toast.error('Unable to load profile. Please login again.')
        return
      }
      
      try {
        const response = await employeeAPI.getById(id)
        const employeeData = response.data.data
        setEmployee(employeeData)
        
        const baseSalary = employeeData.salary || 0
        const allowances = employeeData.salaryStructure?.allowances || {}
        const deductions = employeeData.salaryStructure?.deductions || {}
        
        const formatDateForInput = (date) => {
          if (!date) return ''
          const d = new Date(date)
          return d.toISOString().split('T')[0]
        }
        
        reset({
          ...employeeData,
          dateOfBirth: formatDateForInput(employeeData.dateOfBirth),
          joiningDate: formatDateForInput(employeeData.joiningDate),
          baseSalary: baseSalary,
          houseRentAllowance: allowances.houseRent || 0,
          medicalAllowance: allowances.medical || 0,
          conveyanceAllowance: allowances.transport || 0,
          specialAllowance: allowances.special || 0,
          providentFund: deductions.providentFund || 0,
          professionalTax: deductions.professionalTax || 0,
          incomeTax: deductions.incomeTax || 0,
          otherDeductions: deductions.other || 0,
          emergencyContact: {
            name: employeeData.emergencyContact?.name || '',
            relationship: employeeData.emergencyContact?.relationship || '',
            phone: employeeData.emergencyContact?.phone || '',
          },
        })
      } catch (error) {
        toast.error('Failed to load employee data: ' + (error.response?.data?.message || error.message))
      }
    }
    fetchEmployee()
  }, [user, employeeId, reset])

  const canEdit = user?.role === 'admin' || user?.role === 'hr' || !employeeId
  const isAdmin = user?.role === 'admin'
  const canEditField = (fieldName) => {
    if (isAdmin) return true
    // Employees can only edit these fields
    return ['address', 'phone'].includes(fieldName)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const id = employeeId || user._id || user.id
      
      // If not admin, only send editable fields
      let updateData = data
      if (!isAdmin) {
        updateData = {
          address: data.address,
          phone: data.phone,
        }
      }
      
      const response = await employeeAPI.update(id, updateData)
      const updatedEmployee = response.data.data
      setEmployee(updatedEmployee)
      if (!employeeId) {
        updateUser(updatedEmployee)
      }
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        toast.success('Profile picture uploaded')
      }
      reader.readAsDataURL(file)
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
      {/* Header with Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarImage src={profileImage || employee?.avatar} alt={employee?.name} />
                  <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                    {getInitials(employee?.name)}
                  </AvatarFallback>
                </Avatar>
                {(isEditing && (isAdmin || canEditField('profilePicture'))) && (
                  <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{employee?.name || 'Employee Name'}</h1>
                <p className="text-gray-500 mt-1">{employee?.position || 'Position'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs capitalize">{employee?.role || 'employee'}</Badge>
                  <Badge variant="outline" className="text-xs">{employee?.employeeId || 'N/A'}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Details
          </TabsTrigger>
          <TabsTrigger value="job" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Details
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Salary Structure
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Personal Details Tab */}
          <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        disabled={!isEditing || !canEditField('name')}
                        className={!isEditing || !canEditField('name') ? 'bg-gray-50' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={employee?.employeeId || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        disabled={!isEditing || !canEditField('email')}
                        className={!isEditing || !canEditField('email') ? 'bg-gray-50' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                      {!isAdmin && isEditing && (
                        <p className="text-xs text-green-600">✓ You can edit this field</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      {...register('address')}
                      disabled={!isEditing}
                      placeholder="Enter your full address"
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {!isAdmin && isEditing && (
                      <p className="text-xs text-green-600">✓ You can edit this field</p>
                    )}
                  </div>

                  
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Details Tab */}
            <TabsContent value="job">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        {...register('department')}
                        disabled={!isEditing || !canEditField('department')}
                        className={!isEditing || !canEditField('department') ? 'bg-gray-50' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        {...register('position')}
                        disabled={!isEditing || !canEditField('position')}
                        className={!isEditing || !canEditField('position') ? 'bg-gray-50' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        {...register('joiningDate')}
                        disabled={!isEditing || !canEditField('joiningDate')}
                        className={!isEditing || !canEditField('joiningDate') ? 'bg-gray-50' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select
                        value={watch('employmentType') || 'full-time'}
                        onValueChange={(value) => setValue('employmentType', value)}
                        disabled={!isEditing || !canEditField('employmentType')}
                      >
                        <SelectTrigger className={!isEditing || !canEditField('employmentType') ? 'bg-gray-50' : ''}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <div className="flex items-center h-10 px-3 bg-gray-50 border rounded-md">
                        <Badge variant={employee?.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                          {employee?.status || 'Active'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="flex items-center h-10 px-3 bg-gray-50 border rounded-md">
                        <Badge variant="secondary" className="capitalize">
                          {employee?.role || 'Employee'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Salary Structure Tab */}
            <TabsContent value="salary">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Salary Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Base Salary */}
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary" className="text-base font-semibold">Base Salary</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      {...register('baseSalary', { valueAsNumber: true })}
                      disabled={!isEditing || !canEditField('baseSalary')}
                      className={`text-lg font-semibold ${!isEditing || !canEditField('baseSalary') ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  {/* Allowances */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4 text-green-700">Allowances</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="houseRentAllowance">House Rent Allowance (HRA)</Label>
                        <Input
                          id="houseRentAllowance"
                          type="number"
                          {...register('houseRentAllowance', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('houseRentAllowance')}
                          className={!isEditing || !canEditField('houseRentAllowance') ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                        <Input
                          id="medicalAllowance"
                          type="number"
                          {...register('medicalAllowance', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('medicalAllowance')}
                          className={!isEditing || !canEditField('medicalAllowance') ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conveyanceAllowance">Conveyance Allowance</Label>
                        <Input
                          id="conveyanceAllowance"
                          type="number"
                          {...register('conveyanceAllowance', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('conveyanceAllowance')}
                          className={!isEditing || !canEditField('conveyanceAllowance') ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialAllowance">Special Allowance</Label>
                        <Input
                          id="specialAllowance"
                          type="number"
                          {...register('specialAllowance', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('specialAllowance')}
                          className={!isEditing || !canEditField('specialAllowance') ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4 text-red-700">Deductions</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="providentFund">Provident Fund (PF)</Label>
                        <Input
                          id="providentFund"
                          type="number"
                          {...register('providentFund', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('providentFund')}
                          className={!isEditing || !canEditField('providentFund') ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="professionalTax">Professional Tax</Label>
                        <Input
                          id="professionalTax"
                          type="number"
                          {...register('professionalTax', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('professionalTax')}
                          className={!isEditing || !canEditField('professionalTax') ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incomeTax">Income Tax (TDS)</Label>
                        <Input
                          id="incomeTax"
                          type="number"
                          {...register('incomeTax', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('incomeTax')}
                          className={!isEditing || !canEditField('incomeTax') ? 'bg-gray-50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otherDeductions">Other Deductions</Label>
                        <Input
                          id="otherDeductions"
                          type="number"
                          {...register('otherDeductions', { valueAsNumber: true })}
                          disabled={!isEditing || !canEditField('otherDeductions')}
                          className={!isEditing || !canEditField('otherDeductions') ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Salary Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Gross Salary:</span>
                        <span className="font-semibold text-green-700">{formatCurrency(grossSalary)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Deductions:</span>
                        <span className="font-semibold text-red-700">-{formatCurrency(totalDeductions)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-3">
                        <span>Net Salary:</span>
                        <span className="text-primary">{formatCurrency(netSalary)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Document Upload Section */}
                    {isEditing && isAdmin && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="font-semibold mb-2">Upload Documents</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Drag and drop files here, or click to browse
                        </p>
                        <Button type="button" variant="outline">
                          Choose Files
                        </Button>
                      </div>
                    )}

                    {/* Document List */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-gray-700 mb-3">Uploaded Documents</h3>
                      
                      {[
                        { name: 'Resume.pdf', type: 'Resume', date: '2024-01-15', size: '2.4 MB' },
                        { name: 'Aadhar_Card.pdf', type: 'ID Proof', date: '2024-01-15', size: '1.2 MB' },
                        { name: 'PAN_Card.pdf', type: 'Tax Document', date: '2024-01-15', size: '856 KB' },
                        { name: 'Educational_Certificate.pdf', type: 'Certificate', date: '2024-01-15', size: '3.1 MB' },
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    )
  }
