import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Bell, CreditCard, FileText, GraduationCap, MessageSquare, Wrench,
} from 'lucide-react'
import { db } from '@/mock/db'
import { useSession } from '@/lib/store'
import { ROLE_HOME } from '@/lib/roles'
import { formatDateTime } from '@/lib/utils'

interface Notif {
  id: string
  icon: React.ComponentType<{ className?: string }>
  primary: string
  secondary: string
  at: string
  to: string
}

export function NotificationsButton() {
  const role = useSession((s) => s.role)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const payments = useLiveQuery(
    () => db.payments.orderBy('postedAt').reverse().limit(5).toArray(),
    [],
  )
  const tickets = useLiveQuery(
    () => db.tickets.orderBy('createdAt').reverse().filter((t) => t.status === 'new').limit(5).toArray(),
    [],
  )
  const grades = useLiveQuery(
    () => db.grades.filter((g) => g.status === 'pending').toArray(),
    [],
  )
  const docs = useLiveQuery(
    () => db.documentRequests.orderBy('createdAt').reverse().filter((d) => d.status === 'pending').limit(5).toArray(),
    [],
  )
  const leads = useLiveQuery(
    () => db.leads.orderBy('createdAt').reverse().filter((l) => l.stage === 'inquiry').limit(5).toArray(),
    [],
  )

  const items = useMemo<Notif[]>(() => {
    const arr: Notif[] = []
    payments?.slice(0, 3).forEach((p) => arr.push({
      id: p.id,
      icon: CreditCard,
      primary: `Payment posted · ${p.orNumber}`,
      secondary: `₱${p.amount.toLocaleString()} via ${p.method}`,
      at: p.postedAt,
      to: '/accounting/payments',
    }))
    tickets?.slice(0, 3).forEach((t) => arr.push({
      id: t.id,
      icon: Wrench,
      primary: `New ticket · ${t.category}`,
      secondary: t.title,
      at: t.createdAt,
      to: '/maintenance/tickets',
    }))
    if (grades && grades.length > 0) {
      arr.push({
        id: 'grade-pending',
        icon: GraduationCap,
        primary: `${grades.length} grade${grades.length === 1 ? '' : 's'} pending lock-in`,
        secondary: 'Awaiting Registrar release',
        at: grades[0].submittedAt,
        to: '/registrar/grades',
      })
    }
    docs?.slice(0, 3).forEach((d) => arr.push({
      id: d.id,
      icon: FileText,
      primary: `Document request · ${d.documentType}`,
      secondary: d.purpose,
      at: d.createdAt,
      to: '/registrar/documents',
    }))
    leads?.slice(0, 3).forEach((l) => arr.push({
      id: l.id,
      icon: MessageSquare,
      primary: `New inquiry · ${l.firstName} ${l.lastName}`,
      secondary: `${l.email} · ${l.source}`,
      at: l.createdAt,
      to: '/marketing/leads',
    }))
    arr.sort((a, b) => +new Date(b.at) - +new Date(a.at))
    return arr.slice(0, 8)
  }, [payments, tickets, grades, docs, leads])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(to: string) {
    setOpen(false)
    navigate(to || ROLE_HOME[role])
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-[11px] text-slate-500">Live activity across all offices</div>
          </div>
          <ul>
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-500">All caught up.</li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => go(n.to)}
                  className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">{n.primary}</div>
                    <div className="truncate text-xs text-slate-500">{n.secondary}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(n.at)}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
