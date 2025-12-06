// User roles
export type UserRole = 'staff' | 'advisor';

// Notification interface
export interface Notification {
  id: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'request_correction';
  title: string;
  message: string;
  requestId?: string;
  fromUserId?: string;
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
  cred_points?: number;
}

// Joined Class interface for staff (stored in users.joined_classes JSONB)
export interface JoinedClass {
  class_id: string;
  class_code: string;
  class_name: string;
  advisor_name: string;
  joined_at: string;
}

// Class interface (database-aligned)
export interface Class {
  id: string;
  class_code: string;
  class_name: string;
  department: string | null;
  semester: string | null;
  academic_year: string | null;
  advisor_id: string | null;
  total_students: number; // Maximum capacity
  current_enrollment: number; // Current enrolled count
  is_open: boolean; // Whether class is accepting new enrollments
  created_at: string;
  updated_at: string;
}

// Parameters for creating a new class
export interface CreateClassParams {
  class_name: string;
  class_code: string;
  department?: string;
  semester?: string;
  academic_year?: string;
  total_students?: number; // This represents the maximum capacity
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
  target_staff_id?: string | null;
  target_staff_name?: string | null;
  is_peer_request?: boolean;
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
