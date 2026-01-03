import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/mocks/api'

const loginSchema = z.object({
  loginId: z.string().min(1, 'Login ID or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
      loginId: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Try to login with loginId (could be email or login ID)
      const response = await authAPI.login(data.loginId, data.password, 'employee')
      login(response.data.user, response.data.token)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Invalid credentials')
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
              <Label htmlFor="loginId">Login Id/Email :-</Label>
              <Input
                id="loginId"
                type="text"
                {...register('loginId')}
                className={errors.loginId ? 'border-destructive' : ''}
              />
              {errors.loginId && (
                <p className="text-sm text-destructive">{errors.loginId.message}</p>
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

