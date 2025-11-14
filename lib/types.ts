// User roles
export type UserRole = 'student' | 'representative' | 'advisor';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Class interface
export interface Class {
  id: string;
  name: string;
  code: string;
  joinCode: string;
  studentCount: number;
  students: Student[];
}

// Student interface
export interface Student {
  id: string;
  name: string;
  avatar?: string;
  credPoints?: number;
}

// Attachment interface
export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: 'image' | 'document';
  size?: number;
  mimeType?: string;
}

// Request interface
export interface Request {
  id: string;
  studentName: string;
  studentId: string;
  points: number;
  type: 'add' | 'subtract';
  reason: string;
  date: string;
  time?: string;
  status?: 'approved' | 'rejected' | 'pending';
  avatar?: string;
  attachments?: Attachment[];
  reviewedBy?: string | null;
  reviewDate?: string;
  rejectionReason?: string;
}

// Activity interface
export interface Activity {
  id: string;
  type: 'gain' | 'loss';
  points: number;
  reason: string;
  date: string;
}
