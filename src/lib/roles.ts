import type { Role } from '@/types'

export const ROLES: Role[] = [
  'admin',
  'registrar',
  'accounting',
  'teacher',
  'student',
  'maintenance',
  'marketing',
  'hr',
]

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin Office',
  registrar: 'Registrar',
  accounting: 'Accounting',
  teacher: 'Teacher Portal',
  student: 'Student Portal',
  maintenance: 'Maintenance',
  marketing: 'Marketing / Admissions',
  hr: 'HR / Payroll',
}

export const ROLE_ACCENT: Record<Role, { dot: string; chip: string }> = {
  admin: { dot: 'bg-slate-500', chip: 'bg-slate-100 text-slate-700' },
  registrar: { dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700' },
  accounting: { dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  teacher: { dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  student: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-800' },
  maintenance: { dot: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700' },
  marketing: { dot: 'bg-pink-500', chip: 'bg-pink-50 text-pink-700' },
  hr: { dot: 'bg-teal-500', chip: 'bg-teal-50 text-teal-700' },
}

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  registrar: '/registrar',
  accounting: '/accounting',
  teacher: '/teacher',
  student: '/student',
  maintenance: '/maintenance',
  marketing: '/marketing',
  hr: '/hr',
}
