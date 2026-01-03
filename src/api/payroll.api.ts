import { apiClient } from './axios';
import { Payroll } from '@/types';
import { mockPayrollApi } from '@/mocks/payroll.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const payrollApi = {
  getMyPayroll: async (): Promise<Payroll[]> => {
    if (USE_MOCK) {
      return mockPayrollApi.getMyPayroll();
    }
    const response = await apiClient.get<Payroll[]>('/api/payroll/me');
    return response.data;
  },
  getAllPayroll: async (): Promise<Payroll[]> => {
    if (USE_MOCK) {
      return mockPayrollApi.getAllPayroll();
    }
    const response = await apiClient.get<Payroll[]>('/api/payroll');
    return response.data;
  },
  updateSalary: async (userId: string, salary: number): Promise<Payroll> => {
    if (USE_MOCK) {
      return mockPayrollApi.updateSalary(userId, salary);
    }
    const response = await apiClient.put<Payroll>(`/api/payroll/${userId}/salary`, { salary });
    return response.data;
  },
  processPayroll: async (month: string, year: number): Promise<Payroll[]> => {
    if (USE_MOCK) {
      return mockPayrollApi.processPayroll(month, year);
    }
    const response = await apiClient.post<Payroll[]>('/api/payroll/process', { month, year });
    return response.data;
  },
};

