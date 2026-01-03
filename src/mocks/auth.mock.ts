import { AuthResponse, LoginCredentials, User } from '@/types';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@dayflow.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    department: 'HR',
    position: 'HR Manager',
    phone: '+1234567890',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'employee@dayflow.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
    phone: '+1234567891',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user || credentials.password !== 'password') {
      throw new Error('Invalid credentials');
    }
    
    return {
      user,
      token: `mock-token-${user.id}`,
    };
  },
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
  },
  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUsers[0];
  },
};

