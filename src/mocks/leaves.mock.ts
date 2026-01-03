import { Leave } from '@/types';
import dayjs from 'dayjs';

let leaves: Leave[] = [
  {
    id: '1',
    userId: '2',
    employeeName: 'John Doe',
    type: 'paid',
    startDate: dayjs().add(5, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().add(7, 'days').format('YYYY-MM-DD'),
    days: 3,
    reason: 'Family vacation',
    status: 'pending',
    appliedAt: dayjs().subtract(2, 'days').toISOString(),
  },
  {
    id: '2',
    userId: '2',
    employeeName: 'John Doe',
    type: 'sick',
    startDate: dayjs().subtract(10, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(9, 'days').format('YYYY-MM-DD'),
    days: 2,
    reason: 'Flu',
    status: 'approved',
    appliedAt: dayjs().subtract(11, 'days').toISOString(),
    reviewedBy: 'Admin User',
    reviewedAt: dayjs().subtract(10, 'days').toISOString(),
  },
  {
    id: '3',
    userId: '3',
    employeeName: 'Bob Johnson',
    type: 'paid',
    startDate: dayjs().add(3, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().add(5, 'days').format('YYYY-MM-DD'),
    days: 3,
    reason: 'Personal matters',
    status: 'pending',
    appliedAt: dayjs().subtract(1, 'day').toISOString(),
  },
];

export const mockLeavesApi = {
  getMyLeaves: async (): Promise<Leave[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return leaves.filter(l => l.userId === '2');
  },
  getAllLeaves: async (): Promise<Leave[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...leaves];
  },
  applyLeave: async (leaveData: Omit<Leave, 'id' | 'userId' | 'employeeName' | 'status' | 'appliedAt'>): Promise<Leave> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newLeave: Leave = {
      ...leaveData,
      id: String(leaves.length + 1),
      userId: '2',
      employeeName: 'John Doe',
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };
    leaves.push(newLeave);
    return newLeave;
  },
  approveLeave: async (id: string, comments?: string): Promise<Leave> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const leave = leaves.find(l => l.id === id);
    if (!leave) throw new Error('Leave not found');
    leave.status = 'approved';
    leave.reviewedBy = 'Admin User';
    leave.reviewedAt = new Date().toISOString();
    if (comments) leave.comments = comments;
    return leave;
  },
  rejectLeave: async (id: string, comments?: string): Promise<Leave> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const leave = leaves.find(l => l.id === id);
    if (!leave) throw new Error('Leave not found');
    leave.status = 'rejected';
    leave.reviewedBy = 'Admin User';
    leave.reviewedAt = new Date().toISOString();
    if (comments) leave.comments = comments;
    return leave;
  },
};

