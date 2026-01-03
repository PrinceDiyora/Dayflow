import { Employee } from '@/types';

const mockEmployees: Employee[] = [
  {
    id: '1',
    email: 'john.doe@dayflow.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
    phone: '+1234567891',
    hireDate: '2024-01-15',
    salary: 75000,
    status: 'active',
  },
  {
    id: '2',
    email: 'jane.smith@dayflow.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Manager',
    phone: '+1234567892',
    hireDate: '2024-02-01',
    salary: 85000,
    status: 'active',
  },
  {
    id: '3',
    email: 'bob.johnson@dayflow.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'employee',
    department: 'Sales',
    position: 'Sales Representative',
    phone: '+1234567893',
    hireDate: '2024-03-10',
    salary: 60000,
    status: 'active',
  },
];

let employees = [...mockEmployees];

export const mockEmployeesApi = {
  getAll: async (): Promise<Employee[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...employees];
  },
  getById: async (id: string): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const employee = employees.find(e => e.id === id);
    if (!employee) throw new Error('Employee not found');
    return employee;
  },
  create: async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newEmployee: Employee = {
      ...employee,
      id: String(employees.length + 1),
    };
    employees.push(newEmployee);
    return newEmployee;
  },
  update: async (id: string, updates: Partial<Employee>): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    employees[index] = { ...employees[index], ...updates };
    return employees[index];
  },
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    employees = employees.filter(e => e.id !== id);
  },
};

