import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { buildSchedule, currentStudentId } from '@/lib/studentHelpers'

const DAYS: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function StudentSchedule() {
  const sid = currentStudentId()
  const student = useLiveQuery(() => db.students.get(sid), [sid])
  const schedule = buildSchedule(student)

  return (
    <>
      <PageHeader
        title="Class Schedule"
        subtitle={student ? `${student.section} · AY 2026–2027 · 1st Semester` : ''}
      />

      <div className="card overflow-hidden">
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50">
          {DAYS.map((d) => (
            <div key={d} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {DAYS.map((day) => {
            const items = schedule
              .filter((c) => c.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
            return (
              <div key={day} className="min-h-[300px] space-y-2 p-2">
                {items.map((c, i) => (
                  <div key={i} className="rounded-lg border border-brand-100 bg-brand-50 p-2.5">
                    <div className="text-[11px] font-medium text-brand-700">
                      {c.startTime} – {c.endTime}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-800">{c.subject}</div>
                    <div className="text-xs text-slate-600">{c.teacher}</div>
                    <div className="text-[11px] text-slate-500">{c.room}</div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="grid h-full place-items-center text-xs text-slate-300">
                    Free
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
