import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/mocks/api'

const signupSchema = z.object({
  employeeId: z.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .regex(/^EMP\d{3,}$/, 'Employee ID must be in format EMP001, EMP002, etc.'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8, 'Confirm Password is required'),
  role: z.enum(['employee', 'hr', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function Signup() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoFile, setLogoFile] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
    },
  })

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      toast.success('Logo uploaded successfully')
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.signup(data.employeeId, data.email, data.password, data.role, {
        name: data.name,
        phone: data.phone,
      })
      login(response.data.user, response.data.token)
      toast.success('Account created successfully! Email verification sent.')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-muted-foreground mt-2">Register as a new employee</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="EMP001"
                {...register('employeeId')}
                className={errors.employeeId ? 'border-destructive' : ''}
              />
              {errors.employeeId && (
                <p className="text-sm text-destructive">{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234-567-8900"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                {...register('role')}
                className="w-full border border-input bg-background px-3 py-2 rounded-md"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Officer</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter strong password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must contain 8+ characters, uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

