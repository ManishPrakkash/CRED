// User roles
export type UserRole = 'staff' | 'advisor';

// Notification interface
export interface Notification {
  id: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'request_correction';
  title: string;
  message: string;
  requestId: string;
  fromUserId: string;
  fromUserName: string;
  read: boolean;
  createdAt: string;
  requestData?: any; // Store the full request data for viewing
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  currentClassId?: string | null;
  joinedClasses?: JoinedClass[];
  notifications?: Notification[];
}

// Joined Class interface for staff
export interface JoinedClass {
  id: string;
  name: string;
  joinCode: string;
  joinedAt: string;
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
  studentName?: string;
  studentId?: string;
  staffName?: string;
  staffId?: string;
  points: number;
  type: 'add' | 'subtract';
  reason: string;
  workDescription?: string;
  date: string;
  time?: string;
  status?: 'approved' | 'rejected' | 'pending';
  avatar?: string;
  attachments?: Attachment[];
  reviewedBy?: string | null;
  reviewDate?: string;
  rejectionReason?: string;
  classId?: string;
}

// Activity interface
export interface Activity {
  id: string;
  type: 'gain' | 'loss';
  points: number;
  reason: string;
  date: string;
}
