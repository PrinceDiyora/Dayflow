import { apiClient } from './axios';
import { AuthResponse, LoginCredentials } from '@/types';
import { mockAuthApi } from '@/mocks/auth.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      return mockAuthApi.login(credentials);
    }
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      return mockAuthApi.logout();
    }
    await apiClient.post('/api/auth/logout');
  },
  getCurrentUser: async () => {
    if (USE_MOCK) {
      return mockAuthApi.getCurrentUser();
    }
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

