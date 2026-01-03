import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import axios from 'axios'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'

const API_URL = 'http://localhost:5000/api'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
})

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Check if admin login
      if (data.identifier.toLowerCase() === 'admin' && data.password === 'admin') {
        const adminUser = {
          _id: 'admin',
          employeeId: 'admin',
          name: 'Admin',
          email: 'admin@company.com',
          role: 'admin',
        }
        login(adminUser, 'admin-token')
        toast.success('Admin login successful!')
        navigate('/profile')
      } else {
        // Regular employee login
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: data.identifier,
          password: data.password,
        }, {
          withCredentials: true,
        })
        
        if (response.data.success) {
          login(response.data.data.user, response.data.data.token)
          toast.success('Login successful!')
          navigate('/profile')
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="w-full h-20 bg-gray-200 rounded-md flex items-center justify-center mb-6">
            <span className="text-gray-500 text-sm">App/Web Logo</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or ID :-</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter email or 'admin' for admin login"
                {...register('identifier')}
                className={errors.identifier ? 'border-destructive' : ''}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password :-</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'SIGN IN'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an Account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-primary hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

