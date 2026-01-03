import { apiClient } from './axios';
import { Leave } from '@/types';
import { mockLeavesApi } from '@/mocks/leaves.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const leavesApi = {
  getMyLeaves: async (): Promise<Leave[]> => {
    if (USE_MOCK) {
      return mockLeavesApi.getMyLeaves();
    }
    const response = await apiClient.get<Leave[]>('/api/leaves/me');
    return response.data;
  },
  getAllLeaves: async (): Promise<Leave[]> => {
    if (USE_MOCK) {
      return mockLeavesApi.getAllLeaves();
    }
    const response = await apiClient.get<Leave[]>('/api/leaves');
    return response.data;
  },
  applyLeave: async (leave: Omit<Leave, 'id' | 'userId' | 'employeeName' | 'status' | 'appliedAt'>): Promise<Leave> => {
    if (USE_MOCK) {
      return mockLeavesApi.applyLeave(leave);
    }
    const response = await apiClient.post<Leave>('/api/leaves', leave);
    return response.data;
  },
  approveLeave: async (id: string, comments?: string): Promise<Leave> => {
    if (USE_MOCK) {
      return mockLeavesApi.approveLeave(id, comments);
    }
    const response = await apiClient.post<Leave>(`/api/leaves/${id}/approve`, { comments });
    return response.data;
  },
  rejectLeave: async (id: string, comments?: string): Promise<Leave> => {
    if (USE_MOCK) {
      return mockLeavesApi.rejectLeave(id, comments);
    }
    const response = await apiClient.post<Leave>(`/api/leaves/${id}/reject`, { comments });
    return response.data;
  },
};

