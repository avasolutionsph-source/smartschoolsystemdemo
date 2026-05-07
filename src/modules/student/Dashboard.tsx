import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, CreditCard, FileText,
  GraduationCap, Megaphone,
} from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { currentStudentId, buildSchedule } from '@/lib/studentHelpers'
import { formatDate, formatPHP } from '@/lib/utils'

const TODAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]

export default function StudentDashboard() {
  const sid = currentStudentId()
  const student = useLiveQuery(() => db.students.get(sid), [sid])
  const payments = useLiveQuery(
    () => db.payments.where('studentId').equals(sid).toArray(),
    [sid],
  )
  const grades = useLiveQuery(
    () => db.grades.where('studentId').equals(sid).toArray(),
    [sid],
  )
  const docs = useLiveQuery(
    () => db.documentRequests.where('studentId').equals(sid).toArray(),
    [sid],
  )
  const announcements = useLiveQuery(
    () =>
      db.announcements
        .orderBy('createdAt')
        .reverse()
        .filter((a) => a.audiences.includes('all') || a.audiences.includes('student'))
        .toArray(),
    [],
  )

  if (!student) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">Loading student…</div>
    )
  }

  const paid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const balance = student.assessment - paid
  const lockedGrades = grades?.filter((g) => g.status === 'locked') ?? []
  const avg = lockedGrades.length
    ? Math.round(lockedGrades.reduce((s, g) => s + g.grade, 0) / lockedGrades.length)
    : null
  const schedule = buildSchedule(student)
  const today = schedule.filter((c) => c.day === TODAY)
  const pendingDocs = docs?.filter((d) => d.status !== 'released').length ?? 0

  return (
    <>
      <PageHeader
        title={`Welcome back, ${student.firstName}`}
        subtitle={`${student.studentNumber} · ${student.program} · ${student.section}`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Outstanding Balance"
          value={formatPHP(balance)}
          hint={`Assessment ${formatPHP(student.assessment)}`}
          icon={CreditCard}
          accent={balance > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          label="Average Grade"
          value={avg ?? '—'}
          hint={`${lockedGrades.length} locked`}
          icon={GraduationCap}
          accent="violet"
        />
        <StatCard
          label="Classes Today"
          value={today.length}
          hint={TODAY}
          icon={CalendarDays}
          accent="blue"
        />
        <StatCard
          label="Document Requests"
          value={pendingDocs}
          hint="Pending"
          icon={FileText}
          accent="pink"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Today's Classes ({TODAY})</h3>
            <Link to="/student/schedule" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              Full schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {today.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {today.map((c, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{c.subject}</div>
                    <div className="text-xs text-slate-500">{c.teacher} · {c.room}</div>
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    {c.startTime} – {c.endTime}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">No classes today.</p>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Announcements</h3>
          </div>
          <ul className="space-y-3">
            {announcements?.slice(0, 4).map((a) => (
              <li key={a.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="text-sm font-medium text-slate-800">{a.title}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{a.body}</div>
                <div className="mt-1 text-[11px] text-slate-400">{formatDate(a.createdAt)}</div>
              </li>
            ))}
            {announcements?.length === 0 && (
              <li className="py-6 text-center text-xs text-slate-400">Nothing new.</li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
