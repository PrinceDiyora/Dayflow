import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, User as UserIcon, Users, Clock, Calendar, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { attendanceApi } from '@/api/attendance.api';
import { Attendance } from '@/types';
import { toast } from '@/hooks/use-toast';

export function Topbar() {
  const { user, logout } = authStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await attendanceApi.getTodayAttendance();
      setTodayAttendance(data);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsChecking(true);
    try {
      await attendanceApi.checkIn();
      toast({
        title: 'Checked in',
        description: 'You have successfully checked in.',
      });
      await fetchTodayAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setIsChecking(true);
    try {
      await attendanceApi.checkOut();
      toast({
        title: 'Checked out',
        description: 'You have successfully checked out.',
      });
      await fetchTodayAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    if (!todayAttendance || !todayAttendance.checkIn) return 'bg-red-500';
    if (todayAttendance.checkIn && !todayAttendance.checkOut) return 'bg-green-500';
    return 'bg-green-500';
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
      case 'hr':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Navigation tabs - visible to all users
  const navTabs = [
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Attendance', href: '/attendance', icon: Clock },
    { label: 'Time Off', href: '/leaves', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/employees">
            <h1 className="text-xl font-bold text-primary">Company Logo</h1>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.href || 
              (tab.href !== '/employees' && location.pathname.startsWith(tab.href));
            
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Check-in/Check-out Section */}
          <div className="flex items-center gap-3 border-r pr-4">
            {!isLoading && (
              <>
                {!todayAttendance?.checkIn ? (
                  <Button
                    size="sm"
                    onClick={handleCheckIn}
                    disabled={isChecking}
                    className="h-8 text-xs"
                  >
                    {isChecking ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : null}
                    Check IN →
                  </Button>
                ) : !todayAttendance?.checkOut ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Since {formatTime(todayAttendance.checkIn)}
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCheckOut}
                      disabled={isChecking}
                      className="h-8 text-xs"
                    >
                      {isChecking ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      ) : null}
                      Check Out →
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Completed
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(todayAttendance.checkIn)} - {formatTime(todayAttendance.checkOut)}
                    </span>
                  </div>
                )}
              </>
            )}
            
            {/* Status Indicator */}
            {!isLoading && (
              <Circle className={cn("h-3 w-3 fill-current", getStatusColor())} />
            )}
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0 relative">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                {/* Status dot on avatar */}
                {!isLoading && (
                  <Circle className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 fill-current border-2 border-background rounded-full",
                    getStatusColor()
                  )} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
