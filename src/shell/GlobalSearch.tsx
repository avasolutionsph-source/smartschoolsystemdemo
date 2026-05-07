import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Briefcase, FileText, Megaphone, Search, Users, Wrench,
} from 'lucide-react'
import { db } from '@/mock/db'
import { cn } from '@/lib/utils'

interface ResultGroup {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: Array<{ id: string; primary: string; secondary: string; to: string }>
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const students = useLiveQuery(() => db.students.toArray(), [])
  const employees = useLiveQuery(() => db.employees.toArray(), [])
  const tickets = useLiveQuery(() => db.tickets.toArray(), [])
  const leads = useLiveQuery(() => db.leads.toArray(), [])
  const announcements = useLiveQuery(
    () => db.announcements.orderBy('createdAt').reverse().toArray(),
    [],
  )

  const groups = useMemo<ResultGroup[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const match = (s: string) => s.toLowerCase().includes(q)

    const sList: ResultGroup['items'] = (students ?? [])
      .filter((s) => match(s.firstName) || match(s.lastName) || match(s.studentNumber))
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        primary: `${s.lastName}, ${s.firstName}`,
        secondary: `${s.studentNumber} · ${s.section}`,
        to: '/registrar/students',
      }))

    const eList: ResultGroup['items'] = (employees ?? [])
      .filter((e) => match(e.firstName) || match(e.lastName) || match(e.employeeNumber) || match(e.position))
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        primary: `${e.lastName}, ${e.firstName}`,
        secondary: `${e.employeeNumber} · ${e.position}`,
        to: '/hr/employees',
      }))

    const tList: ResultGroup['items'] = (tickets ?? [])
      .filter((t) => match(t.title) || match(t.category) || match(t.status))
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        primary: t.title,
        secondary: `${t.category} · ${t.status}`,
        to: '/maintenance/tickets',
      }))

    const lList: ResultGroup['items'] = (leads ?? [])
      .filter((l) => match(l.firstName) || match(l.lastName) || match(l.email))
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        primary: `${l.firstName} ${l.lastName}`,
        secondary: `${l.email} · ${l.stage}`,
        to: '/marketing/leads',
      }))

    const aList: ResultGroup['items'] = (announcements ?? [])
      .filter((a) => match(a.title) || match(a.body))
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        primary: a.title,
        secondary: a.audiences.join(', '),
        to: '/admin/announcements',
      }))

    const out: ResultGroup[] = []
    if (sList.length) out.push({ key: 'students', label: 'Students', icon: Users, items: sList })
    if (eList.length) out.push({ key: 'employees', label: 'Employees', icon: Briefcase, items: eList })
    if (tList.length) out.push({ key: 'tickets', label: 'Tickets', icon: Wrench, items: tList })
    if (lList.length) out.push({ key: 'leads', label: 'Leads', icon: FileText, items: lList })
    if (aList.length) out.push({ key: 'ann', label: 'Announcements', icon: Megaphone, items: aList })
    return out
  }, [query, students, employees, tickets, leads, announcements])

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(to: string) {
    setOpen(false)
    setQuery('')
    navigate(to)
  }

  const totalResults = groups.reduce((s, g) => s + g.items.length, 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search students, employees, tickets…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          className="input pl-9"
        />
      </div>

      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {totalResults === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No matches for "{query}"</div>
          ) : (
            groups.map((g) => (
              <div key={g.key} className="mb-1">
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <g.icon className="h-3 w-3" /> {g.label}
                </div>
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => go(it.to)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50',
                    )}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500">
                      <g.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-slate-800">{it.primary}</div>
                      <div className="truncate text-xs text-slate-500">{it.secondary}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
