
export enum Status {
  PENDING = 'Pending',
  RESOLVED = 'Resolved',
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  PROCESSING = 'Processing',
  TRIAL_PENDING = 'Trial Pending',
  ASSIGNED = 'Assigned',
  DROPPED = 'Dropped'
}

export enum Urgency {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface MatchProfile {
  selectedClass: string;
  subjects: string[];
  isManualSubject: boolean;
  manualSubjectName: string | null;
  urgency: Urgency;
  deadline: string;
  parentBudget: string;
  isFinalized: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: Status;
}

export interface Appointment {
  id: string;
  parentName: string;
  childName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  topic: string;
  status: Status;
  matchProfile?: MatchProfile;
}

export interface TeacherRequest {
  id: string;
  parentName: string;
  studentName: string;
  subject: string;
  intensity: 'Weekly' | 'Bi-weekly' | 'Daily';
  preferredGender: 'Male' | 'Female' | 'No Preference';
  notes: string;
  status: Status;
  dateCreated: string;
}

export interface ManualMatch {
  id: string;
  parentName: string;
  phoneNumber: string;
  subject: string;
  gradeLevel: string;
  status: Status;
  dateAdded: string;
}

export interface DashboardStats {
  totalInquiries: number;
  activeAppointments: number;
  teacherRequests: number;
  resolutionRate: string;
}

export type RetentionPeriod = 7 | 14 | 21;
