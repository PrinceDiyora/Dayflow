import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Upload } from 'lucide-react';
import { employeesApi } from '@/api/employees.api';

const signupSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const { user } = authStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Check if user is Admin/HR (only they can create accounts)
  const isAuthorized = user?.role === 'admin' || user?.role === 'hr';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    if (!isAuthorized) {
      toast({
        title: 'Access Denied',
        description: 'Only HR officers and Admins can create new accounts.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Split name into first and last name
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create employee (backend will auto-generate Login ID and password)
      await employeesApi.create({
        email: data.email,
        firstName,
        lastName,
        department: data.companyName, // Using company name as department for now
        position: 'Employee',
        phone: data.phone,
        salary: 0, // Default salary, can be updated later
      });

      toast({
        title: 'Account Created',
        description: 'Employee account has been created. Login ID and password will be auto-generated.',
      });

      // Navigate back to employees page or dashboard
      navigate('/employees');
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      toast({
        title: 'Logo uploaded',
        description: file.name,
      });
    }
  };

  // Show warning if not logged in or not authorized, but still show the form
  const showWarning = !user || !isAuthorized;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardContent className="p-8">
          {/* Logo Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center relative">
              {logoFile ? (
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Company Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <span className="text-sm text-muted-foreground">App/Web Logo</span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">Sign Up Page</h1>

          {showWarning && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {!user ? (
                  <>
                    <strong>Note:</strong> You must be logged in as Admin or HR to create new accounts.{' '}
                    <Link to="/login" className="underline font-medium">
                      Login here
                    </Link>
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> Only Admin and HR officers can create new employee accounts.
                  </>
                )}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="companyName" className="flex-1">
                  Company Name :-
                </Label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Upload className="h-5 w-5 text-primary hover:text-primary/80" />
                </label>
              </div>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter company name"
                {...register('companyName')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name :-</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                {...register('name')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email :-</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register('email')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone :-</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                {...register('phone')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password :-</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  {...register('password')}
                  disabled={isLoading}
                  className="rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password :-</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                  className="rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg mt-6"
              disabled={isLoading || !isAuthorized}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
            {!isAuthorized && (
              <p className="text-xs text-center text-muted-foreground">
                Please login as Admin or HR to create accounts
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Login ID and initial password will be auto-generated by the system.
              The user can login and change the system-generated password.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

