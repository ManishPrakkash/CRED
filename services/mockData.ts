import type { User, UserRole } from '@/lib/types';

// Mock user data for different roles
const mockUsers: Record<UserRole, User> = {
  student: {
    id: '1',
    email: 'student@gmail.com',
    name: 'John Student',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  representative: {
    id: '2',
    email: 'representative@gmail.com',
    name: 'Jane Representative',
    role: 'representative',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100',
  },
  advisor: {
    id: '3',
    email: 'advisor@gmail.com',
    name: 'Dr. Advisor',
    role: 'advisor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  },
};

// Mock login function
export async function mockLogin(
  email: string,
  password: string,
  role: UserRole
): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simple validation
  if (password !== 'password') {
    throw new Error('Invalid password');
  }

  const user = mockUsers[role];
  const normalizedEmail = email.trim().toLowerCase();
  if (user.email.toLowerCase() !== normalizedEmail) {
    throw new Error('Invalid email for selected role');
  }

  return user;
}
