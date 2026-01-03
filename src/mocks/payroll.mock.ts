import { Payroll } from '@/types';

const mockPayroll: Payroll[] = [
  {
    id: '1',
    userId: '2',
    employeeName: 'John Doe',
    month: 'December',
    year: 2024,
    baseSalary: 75000,
    allowances: 5000,
    deductions: 2000,
    netSalary: 78000,
    status: 'paid',
  },
  {
    id: '2',
    userId: '2',
    employeeName: 'John Doe',
    month: 'November',
    year: 2024,
    baseSalary: 75000,
    allowances: 5000,
    deductions: 2000,
    netSalary: 78000,
    status: 'paid',
  },
];

export const mockPayrollApi = {
  getMyPayroll: async (): Promise<Payroll[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPayroll.filter(p => p.userId === '2');
  },
  getAllPayroll: async (): Promise<Payroll[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockPayroll];
  },
  updateSalary: async (userId: string, salary: number): Promise<Payroll> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: '1',
      userId,
      employeeName: 'John Doe',
      month: 'December',
      year: 2024,
      baseSalary: salary,
      allowances: 5000,
      deductions: 2000,
      netSalary: salary + 5000 - 2000,
      status: 'pending',
    };
  },
  processPayroll: async (month: string, year: number): Promise<Payroll[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPayroll;
  },
};

