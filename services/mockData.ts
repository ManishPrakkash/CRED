import type { User, UserRole } from '@/lib/types';

// Mock user data for different roles
const mockUsers: Record<UserRole, User> = {
  staff: {
    id: '1',
    email: 'staff@gmail.com',
    name: 'John Staff',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    joinedClasses: [],
    currentClassId: null,
  },
  advisor: {
    id: '3',
    email: 'advisor@gmail.com',
    name: 'Dr. HOD',
    role: 'advisor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  },
};

// Mock student leaderboard data
export interface LeaderboardStudent {
  id: string;
  name: string;
  studentId: string;
  credPoints: number;
  avatar?: string;
}

export const mockLeaderboardStudents: LeaderboardStudent[] = [
  { id: '1', name: 'Emily Watson', studentId: 'S10001', credPoints: 2850 },
  { id: '2', name: 'Michael Chen', studentId: 'S10002', credPoints: 2650 },
  { id: '3', name: 'Sarah Johnson', studentId: 'S10003', credPoints: 2450 },
  { id: '4', name: 'David Martinez', studentId: 'S10004', credPoints: 2200 },
  { id: '5', name: 'Jessica Brown', studentId: 'S10005', credPoints: 2100 },
  { id: '6', name: 'James Wilson', studentId: 'S10006', credPoints: 1950 },
  { id: '7', name: 'Linda Garcia', studentId: 'S10007', credPoints: 1850 },
  { id: '8', name: 'Robert Taylor', studentId: 'S10008', credPoints: 1750 },
  { id: '9', name: 'Maria Rodriguez', studentId: 'S10009', credPoints: 1650 },
  { id: '10', name: 'John Anderson', studentId: 'S10010', credPoints: 1550 },
  { id: '11', name: 'Jennifer Lee', studentId: 'S10011', credPoints: 1450 },
  { id: '12', name: 'William Moore', studentId: 'S10012', credPoints: 1350 },
  { id: '13', name: 'Patricia Thomas', studentId: 'S10013', credPoints: 1250 },
  { id: '14', name: 'Christopher Jackson', studentId: 'S10014', credPoints: 1150 },
  { id: '15', name: 'Barbara White', studentId: 'S10015', credPoints: 1050 },
  { id: '16', name: 'Daniel Harris', studentId: 'S10016', credPoints: 950 },
  { id: '17', name: 'Nancy Martin', studentId: 'S10017', credPoints: 850 },
  { id: '18', name: 'Matthew Thompson', studentId: 'S10018', credPoints: 750 },
  { id: '19', name: 'Betty Garcia', studentId: 'S10019', credPoints: 650 },
  { id: '20', name: 'Anthony Martinez', studentId: 'S10020', credPoints: 550 },
];

// Mock login function - automatically detects role from email
export async function mockLogin(
  email: string,
  password: string
): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate password - check role-specific passwords
  const passwordMap: Record<string, string> = {
    'staff@gmail.com': 'staff123',
    'advisor@gmail.com': 'advisor123',
  };

  const normalizedEmail = email.trim().toLowerCase();
  const expectedPassword = passwordMap[normalizedEmail];

  if (!expectedPassword || password !== expectedPassword) {
    throw new Error('Invalid email or password');
  }

  // Auto-detect role from email
  const userEntry = Object.entries(mockUsers).find(
    ([_, user]) => user.email.toLowerCase() === normalizedEmail
  );

  if (!userEntry) {
    throw new Error('Invalid email. Please use a registered email address.');
  }

  return userEntry[1];
}

