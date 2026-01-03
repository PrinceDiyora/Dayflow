import { apiClient } from './axios';
import { Attendance } from '@/types';
import { mockAttendanceApi } from '@/mocks/attendance.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const attendanceApi = {
  getMyAttendance: async (): Promise<Attendance[]> => {
    if (USE_MOCK) {
      return mockAttendanceApi.getMyAttendance();
    }
    const response = await apiClient.get<Attendance[]>('/api/attendance/me');
    return response.data;
  },
  getAllAttendance: async (): Promise<Attendance[]> => {
    if (USE_MOCK) {
      return mockAttendanceApi.getAllAttendance();
    }
    const response = await apiClient.get<Attendance[]>('/api/attendance');
    return response.data;
  },
  checkIn: async (): Promise<Attendance> => {
    if (USE_MOCK) {
      return mockAttendanceApi.checkIn();
    }
    const response = await apiClient.post<Attendance>('/api/attendance/check-in');
    return response.data;
  },
  checkOut: async (): Promise<Attendance> => {
    if (USE_MOCK) {
      return mockAttendanceApi.checkOut();
    }
    const response = await apiClient.post<Attendance>('/api/attendance/check-out');
    return response.data;
  },
  getTodayAttendance: async (): Promise<Attendance | null> => {
    if (USE_MOCK) {
      return mockAttendanceApi.getTodayAttendance();
    }
    const response = await apiClient.get<Attendance | null>('/api/attendance/today');
    return response.data;
  },
};

