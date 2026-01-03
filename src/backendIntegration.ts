/**
 * Dayflow HRMS - Backend Integration Specification
 * 
 * Single source of truth for all API contracts between frontend and backend.
 * This file is machine-readable and used to generate:
 * - backend-integration.json
 * - integration-tracker.md
 * - API validation
 * 
 * Version: 1.0.0
 * Last Updated: 2024-12-19
 */

import axios, { AxiosInstance } from 'axios';
import { authStore } from './store/auth.store';

// ============================================================================
// DOMAIN TYPES (Strict - Derived from PDF & Frontend Usage)
// ============================================================================

export type UserRole = 'employee' | 'admin' | 'hr';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface EmployeeProfile extends User {
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  status: 'present' | 'absent' | 'half-day' | 'leave';
  totalHours?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  type: 'paid' | 'sick' | 'unpaid';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string; // ISO 8601
  reviewedBy?: string;
  reviewedAt?: string; // ISO 8601
  comments?: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  employeeName: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
}

export interface Payslip {
  id: string;
  userId: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  pdfUrl?: string;
  generatedAt: string; // ISO 8601
}

export interface DashboardOverview {
  employeeCount?: number;
  attendanceCount?: number;
  pendingLeaves?: number;
  payrollTotal?: number;
  recentActivity?: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================================
// ENDPOINT STATUS
// ============================================================================

export type EndpointStatus = 'implemented' | 'mocked' | 'pending';

// ============================================================================
// ENDPOINT SPECIFICATION
// ============================================================================

export interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  authRequired: boolean;
  allowedRoles: UserRole[];
  requestSchema?: {
    body?: Record<string, any>;
    params?: Record<string, any>;
    query?: Record<string, any>;
  };
  responseSchema: any;
  status: EndpointStatus;
  usedBy: string[]; // Frontend pages/components that use this endpoint
  description: string;
  mockAvailable: boolean;
}

export interface DomainSpec {
  domain: string;
  endpoints: Record<string, EndpointSpec>;
}

export interface BackendIntegrationSpec {
  meta: {
    version: string;
    lastUpdated: string;
    author: string;
    changeSummary: string;
  };
  baseUrl: string;
  authentication: {
    type: 'Bearer Token';
    header: string;
    format: string;
  };
  domains: DomainSpec[];
}

// ============================================================================
// BACKEND INTEGRATION SPECIFICATION
// ============================================================================

export const backendIntegrationSpec: BackendIntegrationSpec = {
  meta: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'Dayflow HRMS Team',
    changeSummary: 'Initial backend integration specification',
  },
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  authentication: {
    type: 'Bearer Token',
    header: 'Authorization',
    format: 'Bearer {token}',
  },
  domains: [
    // ========================================================================
    // AUTH DOMAIN
    // ========================================================================
    {
      domain: 'auth',
      endpoints: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          authRequired: false,
          allowedRoles: [],
          requestSchema: {
            body: {
              email: 'string',
              password: 'string',
            },
          },
          responseSchema: {
            user: 'User',
            token: 'string (JWT)',
          },
          status: 'mocked',
          usedBy: ['pages/auth/login.tsx'],
          description: 'Authenticate user and receive JWT token',
          mockAvailable: true,
        },
        logout: {
          method: 'POST',
          path: '/api/auth/logout',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: {
            message: 'string',
          },
          status: 'mocked',
          usedBy: ['components/layout/topbar.tsx'],
          description: 'Logout current user',
          mockAvailable: true,
        },
        getCurrentUser: {
          method: 'GET',
          path: '/api/auth/me',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'User',
          status: 'mocked',
          usedBy: ['store/auth.store.ts'],
          description: 'Get current authenticated user',
          mockAvailable: true,
        },
      },
    },
    // ========================================================================
    // EMPLOYEES DOMAIN
    // ========================================================================
    {
      domain: 'employees',
      endpoints: {
        getAll: {
          method: 'GET',
          path: '/api/employees',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {},
          responseSchema: 'Employee[]',
          status: 'mocked',
          usedBy: ['pages/employees/employees.tsx', 'pages/dashboard/admin-dashboard.tsx'],
          description: 'Get all employees (Admin/HR only)',
          mockAvailable: true,
        },
        getById: {
          method: 'GET',
          path: '/api/employees/:id',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
          },
          responseSchema: 'Employee',
          status: 'mocked',
          usedBy: ['pages/employees/employees.tsx'],
          description: 'Get employee by ID',
          mockAvailable: true,
        },
        create: {
          method: 'POST',
          path: '/api/employees',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            body: {
              email: 'string',
              firstName: 'string',
              lastName: 'string',
              department: 'string',
              position: 'string',
              phone: 'string',
              salary: 'number',
              role: 'employee (default)',
            },
          },
          responseSchema: 'Employee',
          status: 'mocked',
          usedBy: ['pages/employees/employees.tsx'],
          description: 'Create new employee',
          mockAvailable: true,
        },
        update: {
          method: 'PUT',
          path: '/api/employees/:id',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
            body: {
              email: 'string (optional)',
              firstName: 'string (optional)',
              lastName: 'string (optional)',
              department: 'string (optional)',
              position: 'string (optional)',
              phone: 'string (optional)',
              salary: 'number (optional)',
              status: 'active | inactive (optional)',
            },
          },
          responseSchema: 'Employee',
          status: 'mocked',
          usedBy: ['pages/employees/employees.tsx'],
          description: 'Update employee',
          mockAvailable: true,
        },
        delete: {
          method: 'DELETE',
          path: '/api/employees/:id',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
          },
          responseSchema: {
            message: 'string',
          },
          status: 'mocked',
          usedBy: ['pages/employees/employees.tsx'],
          description: 'Delete employee',
          mockAvailable: true,
        },
      },
    },
    // ========================================================================
    // ATTENDANCE DOMAIN
    // ========================================================================
    {
      domain: 'attendance',
      endpoints: {
        getMyAttendance: {
          method: 'GET',
          path: '/api/attendance/me',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'AttendanceRecord[]',
          status: 'mocked',
          usedBy: ['pages/attendance/attendance.tsx', 'pages/dashboard/employee-dashboard.tsx'],
          description: 'Get current user attendance records',
          mockAvailable: true,
        },
        getAllAttendance: {
          method: 'GET',
          path: '/api/attendance',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {},
          responseSchema: 'AttendanceRecord[]',
          status: 'mocked',
          usedBy: ['pages/attendance/attendance.tsx', 'pages/dashboard/admin-dashboard.tsx'],
          description: 'Get all employees attendance (Admin/HR only)',
          mockAvailable: true,
        },
        checkIn: {
          method: 'POST',
          path: '/api/attendance/check-in',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'AttendanceRecord',
          status: 'mocked',
          usedBy: ['pages/attendance/attendance.tsx'],
          description: 'Check in for today',
          mockAvailable: true,
        },
        checkOut: {
          method: 'POST',
          path: '/api/attendance/check-out',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'AttendanceRecord',
          status: 'mocked',
          usedBy: ['pages/attendance/attendance.tsx'],
          description: 'Check out for today',
          mockAvailable: true,
        },
        getTodayAttendance: {
          method: 'GET',
          path: '/api/attendance/today',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'AttendanceRecord | null',
          status: 'mocked',
          usedBy: ['pages/attendance/attendance.tsx'],
          description: 'Get today attendance record',
          mockAvailable: true,
        },
      },
    },
    // ========================================================================
    // LEAVES DOMAIN
    // ========================================================================
    {
      domain: 'leaves',
      endpoints: {
        getMyLeaves: {
          method: 'GET',
          path: '/api/leaves/me',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'LeaveRequest[]',
          status: 'mocked',
          usedBy: ['pages/leaves/leaves.tsx', 'pages/dashboard/employee-dashboard.tsx'],
          description: 'Get current user leave requests',
          mockAvailable: true,
        },
        getAllLeaves: {
          method: 'GET',
          path: '/api/leaves',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {},
          responseSchema: 'LeaveRequest[]',
          status: 'mocked',
          usedBy: ['pages/leaves/leaves.tsx', 'pages/dashboard/admin-dashboard.tsx'],
          description: 'Get all leave requests (Admin/HR only)',
          mockAvailable: true,
        },
        applyLeave: {
          method: 'POST',
          path: '/api/leaves',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {
            body: {
              type: 'paid | sick | unpaid',
              startDate: 'string (YYYY-MM-DD)',
              endDate: 'string (YYYY-MM-DD)',
              reason: 'string',
            },
          },
          responseSchema: 'LeaveRequest',
          status: 'mocked',
          usedBy: ['pages/leaves/leaves.tsx'],
          description: 'Apply for leave',
          mockAvailable: true,
        },
        approveLeave: {
          method: 'POST',
          path: '/api/leaves/:id/approve',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
            body: {
              comments: 'string (optional)',
            },
          },
          responseSchema: 'LeaveRequest',
          status: 'mocked',
          usedBy: ['pages/leaves/leaves.tsx'],
          description: 'Approve leave request (Admin/HR only)',
          mockAvailable: true,
        },
        rejectLeave: {
          method: 'POST',
          path: '/api/leaves/:id/reject',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
            body: {
              comments: 'string (optional)',
            },
          },
          responseSchema: 'LeaveRequest',
          status: 'mocked',
          usedBy: ['pages/leaves/leaves.tsx'],
          description: 'Reject leave request (Admin/HR only)',
          mockAvailable: true,
        },
      },
    },
    // ========================================================================
    // PAYROLL DOMAIN
    // ========================================================================
    {
      domain: 'payroll',
      endpoints: {
        getMyPayroll: {
          method: 'GET',
          path: '/api/payroll/me',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'PayrollRecord[]',
          status: 'mocked',
          usedBy: ['pages/payroll/payroll.tsx', 'pages/dashboard/employee-dashboard.tsx'],
          description: 'Get current user payroll records',
          mockAvailable: true,
        },
        getAllPayroll: {
          method: 'GET',
          path: '/api/payroll',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {},
          responseSchema: 'PayrollRecord[]',
          status: 'mocked',
          usedBy: ['pages/payroll/payroll.tsx', 'pages/dashboard/admin-dashboard.tsx'],
          description: 'Get all payroll records (Admin/HR only)',
          mockAvailable: true,
        },
        updateSalary: {
          method: 'PUT',
          path: '/api/payroll/:userId/salary',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            params: {
              userId: 'string',
            },
            body: {
              salary: 'number',
            },
          },
          responseSchema: 'PayrollRecord',
          status: 'mocked',
          usedBy: ['pages/payroll/payroll.tsx'],
          description: 'Update employee salary (Admin/HR only)',
          mockAvailable: true,
        },
        processPayroll: {
          method: 'POST',
          path: '/api/payroll/process',
          authRequired: true,
          allowedRoles: ['admin', 'hr'],
          requestSchema: {
            body: {
              month: 'string',
              year: 'number',
            },
          },
          responseSchema: 'PayrollRecord[]',
          status: 'mocked',
          usedBy: ['pages/payroll/payroll.tsx'],
          description: 'Process payroll for a specific month (Admin/HR only)',
          mockAvailable: true,
        },
      },
    },
    // ========================================================================
    // PAYSLIPS DOMAIN
    // ========================================================================
    {
      domain: 'payslips',
      endpoints: {
        getMyPayslips: {
          method: 'GET',
          path: '/api/payslips/me',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {},
          responseSchema: 'Payslip[]',
          status: 'mocked',
          usedBy: ['pages/payslips/payslips.tsx'],
          description: 'Get current user payslips',
          mockAvailable: true,
        },
        getPayslipById: {
          method: 'GET',
          path: '/api/payslips/:id',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
          },
          responseSchema: 'Payslip',
          status: 'mocked',
          usedBy: ['pages/payslips/payslips.tsx'],
          description: 'Get payslip by ID',
          mockAvailable: true,
        },
        downloadPayslip: {
          method: 'GET',
          path: '/api/payslips/:id/download',
          authRequired: true,
          allowedRoles: ['employee', 'admin', 'hr'],
          requestSchema: {
            params: {
              id: 'string',
            },
          },
          responseSchema: 'Blob (PDF)',
          status: 'mocked',
          usedBy: ['pages/payslips/payslips.tsx'],
          description: 'Download payslip as PDF',
          mockAvailable: true,
        },
      },
    },
  ],
};

// ============================================================================
// API CLIENT FACTORY
// ============================================================================

export function createApiClient(): AxiosInstance {
  const config = useEnvConfig();
  // In mock mode, use empty baseURL (mocks handle the routing)
  const baseURL = config.useMock ? '' : config.apiUrl;
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - JWT token injection
  client.interceptors.request.use(
    (config) => {
      const token = authStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Error handling & token refresh (future-safe)
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Unauthorized - logout user
        authStore.getState().logout();
        window.location.href = '/login';
      }
      // TODO: Implement refresh token logic here when backend supports it
      return Promise.reject(error);
    }
  );

  return client;
}

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export interface EnvConfig {
  apiUrl: string;
  useMock: boolean;
  environment: 'development' | 'production' | 'test';
}

export function useEnvConfig(): EnvConfig {
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    useMock: import.meta.env.VITE_USE_MOCK === 'true',
    environment: (import.meta.env.MODE as any) || 'development',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all endpoints for a specific domain
 */
export function getEndpointsByDomain(domain: string): Record<string, EndpointSpec> {
  const domainSpec = backendIntegrationSpec.domains.find((d) => d.domain === domain);
  return domainSpec?.endpoints || {};
}

/**
 * Get endpoint by path and method
 */
export function getEndpointByPath(
  path: string,
  method: string
): EndpointSpec | undefined {
  for (const domain of backendIntegrationSpec.domains) {
    for (const endpoint of Object.values(domain.endpoints)) {
      if (endpoint.path === path && endpoint.method === method) {
        return endpoint;
      }
    }
  }
  return undefined;
}

/**
 * Get all pending endpoints
 */
export function getPendingEndpoints(): EndpointSpec[] {
  const pending: EndpointSpec[] = [];
  for (const domain of backendIntegrationSpec.domains) {
    for (const endpoint of Object.values(domain.endpoints)) {
      if (endpoint.status === 'pending') {
        pending.push(endpoint);
      }
    }
  }
  return pending;
}

/**
 * Get all mocked endpoints
 */
export function getMockedEndpoints(): EndpointSpec[] {
  const mocked: EndpointSpec[] = [];
  for (const domain of backendIntegrationSpec.domains) {
    for (const endpoint of Object.values(domain.endpoints)) {
      if (endpoint.status === 'mocked') {
        mocked.push(endpoint);
      }
    }
  }
  return mocked;
}

/**
 * Get all implemented endpoints
 */
export function getImplementedEndpoints(): EndpointSpec[] {
  const implemented: EndpointSpec[] = [];
  for (const domain of backendIntegrationSpec.domains) {
    for (const endpoint of Object.values(domain.endpoints)) {
      if (endpoint.status === 'implemented') {
        implemented.push(endpoint);
      }
    }
  }
  return implemented;
}

