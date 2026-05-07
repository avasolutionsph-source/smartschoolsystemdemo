import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  KanbanSquare,
  LogOut,
  Megaphone,
  ScrollText,
  ShieldCheck,
  UserPlus,
  Users,
  Users2,
  Wrench,
} from 'lucide-react'
import { useSession } from '@/lib/store'
import { ROLE_ACCENT, ROLE_LABEL } from '@/lib/roles'
import { cn, initials } from '@/lib/utils'
import type { Role } from '@/types'

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> }

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users & Roles', icon: ShieldCheck },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ],
  registrar: [
    { to: '/registrar', label: 'Dashboard', icon: Home },
    { to: '/registrar/students', label: 'Students', icon: Users },
    { to: '/registrar/enrollment', label: 'Enrollment', icon: UserPlus },
    { to: '/registrar/documents', label: 'Document Requests', icon: FileText },
  ],
  accounting: [
    { to: '/accounting', label: 'Dashboard', icon: Home },
    { to: '/accounting/soa', label: 'Statements of Account', icon: ScrollText },
    { to: '/accounting/payments', label: 'Payments', icon: CreditCard },
    { to: '/accounting/reports', label: 'Reports', icon: BarChart3 },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: Home },
    { to: '/teacher/classes', label: 'My Classes', icon: Users2 },
    { to: '/teacher/grades', label: 'Grade Encoding', icon: GraduationCap },
    { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: Home },
    { to: '/student/schedule', label: 'Schedule', icon: CalendarDays },
    { to: '/student/grades', label: 'Grades', icon: GraduationCap },
    { to: '/student/soa', label: 'My SOA', icon: ScrollText },
    { to: '/student/documents', label: 'Document Requests', icon: FileText },
  ],
  maintenance: [
    { to: '/maintenance', label: 'Dashboard', icon: Home },
    { to: '/maintenance/tickets', label: 'Tickets', icon: KanbanSquare },
    { to: '/maintenance/assets', label: 'Assets', icon: Wrench },
  ],
  marketing: [
    { to: '/marketing', label: 'Dashboard', icon: Home },
    { to: '/marketing/leads', label: 'Lead Pipeline', icon: KanbanSquare },
    { to: '/marketing/promos', label: 'Promos', icon: Bell },
  ],
  hr: [
    { to: '/hr', label: 'Dashboard', icon: Home },
    { to: '/hr/employees', label: 'Employees', icon: Briefcase },
    { to: '/hr/payroll', label: 'Payroll', icon: CreditCard },
    { to: '/hr/attendance', label: 'Attendance', icon: ClipboardList },
  ],
}

export function Sidebar() {
  const { role, displayName, email, logout } = useSession()
  const navigate = useNavigate()
  const items = NAV[role]
  const accent = ROLE_ACCENT[role]

  function handleLogout() {
    if (!confirm('Sign out of this demo account?')) return
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className={cn('h-2 w-2 rounded-full', accent.dot)} />
        {ROLE_LABEL[role]}
      </div>

      <nav className="flex-1 px-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to.split('/').length === 2}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100',
                isActive && 'bg-brand-50 text-brand-700 font-medium',
              )
            }
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            {initials(displayName)}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-xs font-medium text-slate-800">{displayName}</div>
            <div className="truncate text-[10px] text-slate-500">{email || ROLE_LABEL[role]}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
        <div className="pt-3 text-center text-[10px] uppercase tracking-wider text-slate-400">
          ABC SSS · Frontend Demo
        </div>
      </div>
    </aside>
  )
}
