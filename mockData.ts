
import { ContactInquiry, Appointment, TeacherRequest, Status } from './types';

export const mockInquiries: ContactInquiry[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+91 98765 43210',
    subject: 'Curriculum Question',
    message: 'I would like to know more about the mathematics curriculum for 5th graders. Does it include advanced algebra prep?',
    date: '2024-05-15',
    status: Status.PENDING
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '+91 88888 77777',
    subject: 'School Tour',
    message: 'Are there any open slots for a school tour this Friday? We are planning to move to the area next month.',
    date: '2024-05-14',
    status: Status.RESOLVED
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '101',
    parentName: 'Emily Williams',
    childName: 'Leo Williams',
    email: 'emily@example.com',
    phone: '555-0123',
    date: '2024-05-20',
    time: '10:00 AM',
    topic: 'Mid-term Progress Review',
    status: Status.SCHEDULED
  },
  {
    id: '102',
    parentName: 'David Miller',
    childName: 'Sophia Miller',
    email: 'david.m@example.com',
    phone: '555-0456',
    date: '2024-05-21',
    time: '02:30 PM',
    topic: 'Behavioral Consultation',
    status: Status.SCHEDULED
  }
];

export const mockTeacherRequests: TeacherRequest[] = [
  {
    id: 'tr-001',
    parentName: 'Alice Thompson',
    studentName: 'Max Thompson',
    subject: 'Advanced Physics',
    intensity: 'Weekly',
    preferredGender: 'Female',
    notes: 'Max is struggling with mechanics. Need someone who can explain concepts simply but deeply.',
    status: Status.PROCESSING,
    dateCreated: '2024-05-12'
  }
];
