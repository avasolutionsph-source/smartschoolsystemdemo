import type { Role } from '@/types'
import { ROLE_LABEL } from './roles'

export interface DemoAccount {
  role: Role
  name: string
  email: string
  password: string
  blurb: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'admin', name: 'Admin Demo', email: 'admin@abc.edu', password: 'admin123', blurb: 'Full access to every office' },
  { role: 'registrar', name: 'Registrar Demo', email: 'registrar@abc.edu', password: 'registrar123', blurb: 'Student records, enrollment, documents' },
  { role: 'accounting', name: 'Accounting Demo', email: 'accounting@abc.edu', password: 'accounting123', blurb: 'Tuition, payments, SOA, clearance' },
  { role: 'teacher', name: 'Teacher Demo', email: 'teacher@abc.edu', password: 'teacher123', blurb: 'Classes, attendance, grade encoding' },
  { role: 'student', name: 'Student Demo', email: 'student@abc.edu', password: 'student123', blurb: 'Schedule, grades, balance, requests' },
  { role: 'maintenance', name: 'Maintenance Demo', email: 'maintenance@abc.edu', password: 'maintenance123', blurb: 'Tickets, assets, recurring tasks' },
  { role: 'marketing', name: 'Marketing Demo', email: 'marketing@abc.edu', password: 'marketing123', blurb: 'Inquiries, leads, promotions' },
  { role: 'hr', name: 'HR Demo', email: 'hr@abc.edu', password: 'hr123', blurb: 'Employees, payroll, attendance' },
]

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  const e = email.trim().toLowerCase()
  return DEMO_ACCOUNTS.find((a) => a.email === e && a.password === password)
}

export function demoLabel(role: Role) {
  return ROLE_LABEL[role]
}
