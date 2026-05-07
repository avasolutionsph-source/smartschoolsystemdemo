import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, ClipboardList, GraduationCap, Users2,
} from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { TEACHER_CLASSES } from '@/lib/teacherHelpers'
import { formatDate } from '@/lib/utils'

export default function TeacherDashboard() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const grades = useLiveQuery(() => db.grades.toArray(), [])
  const attendance = useLiveQuery(
    () => db.attendance.orderBy('date').reverse().limit(20).toArray(),
    [],
  )
  const announcements = useLiveQuery(
    () =>
      db.announcements
        .orderBy('createdAt').reverse()
        .filter((a) => a.audiences.includes('all') || a.audiences.includes('teacher'))
        .toArray(),
    [],
  )

  const rosterCount = useMemo(() => {
    if (!students) return 0
    const sections = new Set(TEACHER_CLASSES.map((c) => c.section))
    return students.filter((s) => sections.has(s.section)).length
  }, [students])

  const pendingGrades = useMemo(
    () => (grades ?? []).filter((g) => g.status === 'pending').length,
    [grades],
  )

  const studentMap = useMemo(() => {
    const m = new Map<string, string>()
    students?.forEach((s) => m.set(s.id, `${s.lastName}, ${s.firstName}`))
    return m
  }, [students])

  return (
    <>
      <PageHeader
        title="Teacher Portal"
        subtitle="Welcome back. Your classes, students, and pending tasks at a glance."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Classes" value={TEACHER_CLASSES.length} icon={Users2} accent="violet" />
        <StatCard label="Total Students" value={rosterCount} hint="Across all classes" icon={Users2} accent="blue" />
        <StatCard label="Pending Grades" value={pendingGrades} hint="Awaiting registrar lock" icon={GraduationCap} accent="amber" />
        <StatCard label="Recent Sessions" value={attendance?.length ?? 0} hint="Last attendance entries" icon={ClipboardList} accent="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">My Classes</h3>
            <Link to="/teacher/classes" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              Open class manager <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {TEACHER_CLASSES.map((c) => {
              const enrolled = students?.filter((s) => s.section === c.section).length ?? 0
              return (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{c.subject}</div>
                    <div className="text-xs text-slate-500">{c.section} · {c.days} · {c.time} · {c.room}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">{enrolled}</div>
                    <div className="text-[11px] text-slate-400">students</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Recent Attendance</h3>
          </div>
          {attendance && attendance.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {attendance.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="truncate">{studentMap.get(a.studentId) ?? a.studentId}</span>
                  <span className={`badge capitalize ${
                    a.status === 'present' ? 'bg-emerald-50 text-emerald-700'
                    : a.status === 'late' ? 'bg-amber-50 text-amber-700'
                    : a.status === 'excused' ? 'bg-blue-50 text-blue-700'
                    : 'bg-red-50 text-red-700'
                  }`}>{a.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-slate-400">No attendance recorded yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Announcements for Faculty</h3>
        <ul className="space-y-2 text-sm">
          {announcements?.slice(0, 4).map((a) => (
            <li key={a.id} className="border-b border-slate-100 pb-2 last:border-0">
              <div className="font-medium text-slate-800">{a.title}</div>
              <div className="text-xs text-slate-500">{a.body}</div>
              <div className="text-[11px] text-slate-400">{formatDate(a.createdAt)}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
