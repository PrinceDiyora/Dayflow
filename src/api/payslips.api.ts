import { apiClient } from './axios';
import { Payslip } from '@/types';
import { mockPayslipsApi } from '@/mocks/payslips.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const payslipsApi = {
  getMyPayslips: async (): Promise<Payslip[]> => {
    if (USE_MOCK) {
      return mockPayslipsApi.getMyPayslips();
    }
    const response = await apiClient.get<Payslip[]>('/api/payslips/me');
    return response.data;
  },
  getPayslipById: async (id: string): Promise<Payslip> => {
    if (USE_MOCK) {
      return mockPayslipsApi.getPayslipById(id);
    }
    const response = await apiClient.get<Payslip>(`/api/payslips/${id}`);
    return response.data;
  },
  downloadPayslip: async (id: string): Promise<Blob> => {
    if (USE_MOCK) {
      return mockPayslipsApi.downloadPayslip(id);
    }
    const response = await apiClient.get(`/api/payslips/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

