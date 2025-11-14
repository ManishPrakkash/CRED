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
    'staff@gmail.com': 'password',
    'advisor@gmail.com': 'password',
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

// Mock students for testing class management
export const mockStudents = [
  { id: 's1', name: 'Emma Thompson', email: 'emma.thompson@student.edu', avatar: 'https://i.pravatar.cc/150?img=1', credPoints: 2850 },
  { id: 's2', name: 'Liam Parker', email: 'liam.parker@student.edu', avatar: 'https://i.pravatar.cc/150?img=2', credPoints: 2650 },
  { id: 's3', name: 'Olivia Chen', email: 'olivia.chen@student.edu', avatar: 'https://i.pravatar.cc/150?img=5', credPoints: 2450 },
  { id: 's4', name: 'Noah Martinez', email: 'noah.martinez@student.edu', avatar: 'https://i.pravatar.cc/150?img=3', credPoints: 2200 },
  { id: 's5', name: 'Ava Johnson', email: 'ava.johnson@student.edu', avatar: 'https://i.pravatar.cc/150?img=9', credPoints: 2100 },
  { id: 's6', name: 'Ethan Williams', email: 'ethan.williams@student.edu', avatar: 'https://i.pravatar.cc/150?img=11', credPoints: 1950 },
  { id: 's7', name: 'Sophia Brown', email: 'sophia.brown@student.edu', avatar: 'https://i.pravatar.cc/150?img=10', credPoints: 1850 },
  { id: 's8', name: 'Mason Davis', email: 'mason.davis@student.edu', avatar: 'https://i.pravatar.cc/150?img=12', credPoints: 1750 },
  { id: 's9', name: 'Isabella Garcia', email: 'isabella.garcia@student.edu', avatar: 'https://i.pravatar.cc/150?img=23', credPoints: 1650 },
  { id: 's10', name: 'James Rodriguez', email: 'james.rodriguez@student.edu', avatar: 'https://i.pravatar.cc/150?img=13', credPoints: 1550 },
  { id: 's11', name: 'Charlotte Wilson', email: 'charlotte.wilson@student.edu', avatar: 'https://i.pravatar.cc/150?img=20', credPoints: 1450 },
  { id: 's12', name: 'Benjamin Moore', email: 'benjamin.moore@student.edu', avatar: 'https://i.pravatar.cc/150?img=14', credPoints: 1350 },
  { id: 's13', name: 'Amelia Taylor', email: 'amelia.taylor@student.edu', avatar: 'https://i.pravatar.cc/150?img=24', credPoints: 1250 },
  { id: 's14', name: 'Lucas Anderson', email: 'lucas.anderson@student.edu', avatar: 'https://i.pravatar.cc/150?img=15', credPoints: 1150 },
  { id: 's15', name: 'Mia Thomas', email: 'mia.thomas@student.edu', avatar: 'https://i.pravatar.cc/150?img=25', credPoints: 1050 },
  { id: 's16', name: 'Henry Jackson', email: 'henry.jackson@student.edu', avatar: 'https://i.pravatar.cc/150?img=16', credPoints: 950 },
  { id: 's17', name: 'Harper White', email: 'harper.white@student.edu', avatar: 'https://i.pravatar.cc/150?img=26', credPoints: 850 },
  { id: 's18', name: 'Alexander Harris', email: 'alexander.harris@student.edu', avatar: 'https://i.pravatar.cc/150?img=17', credPoints: 750 },
  { id: 's19', name: 'Evelyn Martin', email: 'evelyn.martin@student.edu', avatar: 'https://i.pravatar.cc/150?img=27', credPoints: 650 },
  { id: 's20', name: 'Sebastian Lee', email: 'sebastian.lee@student.edu', avatar: 'https://i.pravatar.cc/150?img=18', credPoints: 550 },
  { id: 's21', name: 'Abigail Walker', email: 'abigail.walker@student.edu', avatar: 'https://i.pravatar.cc/150?img=28', credPoints: 2750 },
  { id: 's22', name: 'Jack Hall', email: 'jack.hall@student.edu', avatar: 'https://i.pravatar.cc/150?img=19', credPoints: 2550 },
  { id: 's23', name: 'Emily Allen', email: 'emily.allen@student.edu', avatar: 'https://i.pravatar.cc/150?img=29', credPoints: 2350 },
  { id: 's24', name: 'Daniel Young', email: 'daniel.young@student.edu', avatar: 'https://i.pravatar.cc/150?img=33', credPoints: 2150 },
  { id: 's25', name: 'Elizabeth King', email: 'elizabeth.king@student.edu', avatar: 'https://i.pravatar.cc/150?img=30', credPoints: 1850 },
  { id: 's26', name: 'Matthew Wright', email: 'matthew.wright@student.edu', avatar: 'https://i.pravatar.cc/150?img=31', credPoints: 1650 },
  { id: 's27', name: 'Sofia Lopez', email: 'sofia.lopez@student.edu', avatar: 'https://i.pravatar.cc/150?img=32', credPoints: 1550 },
  { id: 's28', name: 'Joseph Hill', email: 'joseph.hill@student.edu', avatar: 'https://i.pravatar.cc/150?img=34', credPoints: 1450 },
  { id: 's29', name: 'Avery Scott', email: 'avery.scott@student.edu', avatar: 'https://i.pravatar.cc/150?img=44', credPoints: 1350 },
  { id: 's30', name: 'David Green', email: 'david.green@student.edu', avatar: 'https://i.pravatar.cc/150?img=35', credPoints: 1250 },
  { id: 's31', name: 'Ella Adams', email: 'ella.adams@student.edu', avatar: 'https://i.pravatar.cc/150?img=45', credPoints: 2900 },
  { id: 's32', name: 'Carter Baker', email: 'carter.baker@student.edu', avatar: 'https://i.pravatar.cc/150?img=36', credPoints: 2700 },
  { id: 's33', name: 'Scarlett Nelson', email: 'scarlett.nelson@student.edu', avatar: 'https://i.pravatar.cc/150?img=46', credPoints: 2500 },
  { id: 's34', name: 'Wyatt Carter', email: 'wyatt.carter@student.edu', avatar: 'https://i.pravatar.cc/150?img=37', credPoints: 2300 },
  { id: 's35', name: 'Grace Mitchell', email: 'grace.mitchell@student.edu', avatar: 'https://i.pravatar.cc/150?img=47', credPoints: 2000 },
  { id: 's36', name: 'Owen Perez', email: 'owen.perez@student.edu', avatar: 'https://i.pravatar.cc/150?img=38', credPoints: 1900 },
  { id: 's37', name: 'Chloe Roberts', email: 'chloe.roberts@student.edu', avatar: 'https://i.pravatar.cc/150?img=48', credPoints: 1800 },
  { id: 's38', name: 'Luke Turner', email: 'luke.turner@student.edu', avatar: 'https://i.pravatar.cc/150?img=39', credPoints: 1700 },
  { id: 's39', name: 'Zoey Phillips', email: 'zoey.phillips@student.edu', avatar: 'https://i.pravatar.cc/150?img=49', credPoints: 1600 },
  { id: 's40', name: 'Jayden Campbell', email: 'jayden.campbell@student.edu', avatar: 'https://i.pravatar.cc/150?img=40', credPoints: 1500 },
  { id: 's41', name: 'Lily Parker', email: 'lily.parker@student.edu', avatar: 'https://i.pravatar.cc/150?img=50', credPoints: 1400 },
  { id: 's42', name: 'Gabriel Evans', email: 'gabriel.evans@student.edu', avatar: 'https://i.pravatar.cc/150?img=41', credPoints: 1300 },
  { id: 's43', name: 'Hannah Edwards', email: 'hannah.edwards@student.edu', avatar: 'https://i.pravatar.cc/150?img=51', credPoints: 1200 },
  { id: 's44', name: 'Ryan Collins', email: 'ryan.collins@student.edu', avatar: 'https://i.pravatar.cc/150?img=42', credPoints: 1100 },
  { id: 's45', name: 'Aria Stewart', email: 'aria.stewart@student.edu', avatar: 'https://i.pravatar.cc/150?img=52', credPoints: 1000 },
  { id: 's46', name: 'Isaac Sanchez', email: 'isaac.sanchez@student.edu', avatar: 'https://i.pravatar.cc/150?img=43', credPoints: 900 },
  { id: 's47', name: 'Layla Morris', email: 'layla.morris@student.edu', avatar: 'https://i.pravatar.cc/150?img=53', credPoints: 800 },
  { id: 's48', name: 'Nathan Rogers', email: 'nathan.rogers@student.edu', avatar: 'https://i.pravatar.cc/150?img=60', credPoints: 700 },
  { id: 's49', name: 'Nora Reed', email: 'nora.reed@student.edu', avatar: 'https://i.pravatar.cc/150?img=54', credPoints: 600 },
  { id: 's50', name: 'Christian Cook', email: 'christian.cook@student.edu', avatar: 'https://i.pravatar.cc/150?img=61', credPoints: 500 },
  { id: 's51', name: 'Hazel Morgan', email: 'hazel.morgan@student.edu', avatar: 'https://i.pravatar.cc/150?img=55', credPoints: 400 },
  { id: 's52', name: 'Aaron Bell', email: 'aaron.bell@student.edu', avatar: 'https://i.pravatar.cc/150?img=62', credPoints: 300 },
  { id: 's53', name: 'Violet Murphy', email: 'violet.murphy@student.edu', avatar: 'https://i.pravatar.cc/150?img=56', credPoints: 200 },
  { id: 's54', name: 'Eli Bailey', email: 'eli.bailey@student.edu', avatar: 'https://i.pravatar.cc/150?img=63', credPoints: 100 },
  { id: 's55', name: 'Aurora Rivera', email: 'aurora.rivera@student.edu', avatar: 'https://i.pravatar.cc/150?img=57', credPoints: 50 },
];

