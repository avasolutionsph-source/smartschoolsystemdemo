export type Role =
  | 'admin'
  | 'registrar'
  | 'accounting'
  | 'teacher'
  | 'student'
  | 'maintenance'
  | 'marketing'
  | 'hr'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  createdAt: string
}

export type StudentStatus = 'enrolled' | 'on-leave' | 'dropped' | 'graduated' | 'transferred-out'

export interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  middleName?: string
  program: string
  yearLevel: number
  section: string
  status: StudentStatus
  email: string
  enrolledAt: string
}

export interface Employee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  position: string
  department: string
  email: string
  hiredAt: string
}

export type AnnouncementAudience = Role | 'all'

export interface Announcement {
  id: string
  title: string
  body: string
  audiences: AnnouncementAudience[]
  createdBy: string
  createdAt: string
}

export interface Payment {
  id: string
  studentId: string
  amount: number
  method: 'cash' | 'bank' | 'online'
  orNumber: string
  postedAt: string
  postedBy: string
}

export interface Grade {
  id: string
  studentId: string
  subject: string
  term: string
  grade: number
  status: 'pending' | 'locked'
  submittedBy: string
  submittedAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: 'electrical' | 'plumbing' | 'it' | 'carpentry' | 'janitorial' | 'other'
  status: 'new' | 'assigned' | 'in-progress' | 'done' | 'verified'
  assignedTo?: string
  createdBy: string
  createdAt: string
}
