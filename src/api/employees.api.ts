import { apiClient } from './axios';
import { Employee } from '@/types';
import { mockEmployeesApi } from '@/mocks/employees.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    if (USE_MOCK) {
      return mockEmployeesApi.getAll();
    }
    const response = await apiClient.get<Employee[]>('/api/employees');
    return response.data;
  },
  getById: async (id: string): Promise<Employee> => {
    if (USE_MOCK) {
      return mockEmployeesApi.getById(id);
    }
    const response = await apiClient.get<Employee>(`/api/employees/${id}`);
    return response.data;
  },
  create: async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
    if (USE_MOCK) {
      return mockEmployeesApi.create(employee);
    }
    const response = await apiClient.post<Employee>('/api/employees', employee);
    return response.data;
  },
  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    if (USE_MOCK) {
      return mockEmployeesApi.update(id, employee);
    }
    const response = await apiClient.put<Employee>(`/api/employees/${id}`, employee);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return mockEmployeesApi.delete(id);
    }
    await apiClient.delete(`/api/employees/${id}`);
  },
};

