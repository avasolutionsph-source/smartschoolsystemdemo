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
  contact?: string
  address?: string
  guardianName?: string
  guardianContact?: string
  enrolledAt: string
  assessment: number
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

export type PaymentMethod = 'cash' | 'bank' | 'online' | 'discount' | 'scholarship'

export interface Payment {
  id: string
  studentId: string
  amount: number
  method: PaymentMethod
  orNumber: string
  remarks?: string
  postedAt: string
  postedBy: string
}

export interface Grade {
  id: string
  studentId: string
  classId?: string
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

export type DocumentType = 'TOR' | 'COE' | 'Form 137' | 'Good Moral'
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'released'

export interface DocumentRequest {
  id: string
  studentId: string
  documentType: DocumentType
  purpose: string
  status: DocumentStatus
  createdAt: string
  updatedAt: string
}

export type ClearanceArea = 'academic' | 'financial' | 'library' | 'laboratory'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  classId: string
  studentId: string
  date: string
  status: AttendanceStatus
  postedBy: string
  postedAt: string
}

export type LeadStage = 'inquiry' | 'contacted' | 'toured' | 'applied' | 'enrolled' | 'lost'

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  contact?: string
  program?: string
  yearLevel?: number
  source: 'walk-in' | 'website' | 'referral' | 'fb' | 'event'
  stage: LeadStage
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AssetStatus = 'operational' | 'maintenance' | 'retired'

export interface Asset {
  id: string
  code: string
  name: string
  category: 'electronics' | 'furniture' | 'lab equipment' | 'vehicle' | 'other'
  location: string
  status: AssetStatus
  purchasedAt: string
}

export type PayrollStatus = 'draft' | 'released'

export interface PayrollRun {
  id: string
  periodStart: string
  periodEnd: string
  status: PayrollStatus
  totalNet: number
  releasedAt?: string
  createdAt: string
}

export interface Payslip {
  id: string
  runId: string
  employeeId: string
  basic: number
  allowances: number
  deductions: number
  net: number
}

export interface ScheduleEntry {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  startTime: string
  endTime: string
  subject: string
  room: string
  teacher: string
}
