import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, MapPin, Users2, X } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { TEACHER_CLASSES, type TeacherClass } from '@/lib/teacherHelpers'
import { initials } from '@/lib/utils'
import type { Student } from '@/types'

export default function TeacherClasses() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const [openClass, setOpenClass] = useState<TeacherClass | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    if (students) {
      for (const c of TEACHER_CLASSES) {
        m.set(c.id, students.filter((s) => s.section === c.section).length)
      }
    }
    return m
  }, [students])

  return (
    <>
      <PageHeader
        title="My Classes"
        subtitle="Click a class to view its roster. Use Attendance and Grades pages for encoding."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEACHER_CLASSES.map((c) => (
          <button
            key={c.id}
            onClick={() => setOpenClass(c)}
            className="card flex flex-col gap-3 p-5 text-left transition hover:shadow-md hover:ring-2 hover:ring-brand-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-violet-600">
                  {c.section}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{c.subject}</h3>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-700">
                <Users2 className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>{c.days}</span>
              <span>{c.time}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {c.room}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="text-xs text-slate-500">
                <span className="text-base font-semibold text-slate-800">{counts.get(c.id) ?? 0}</span>{' '}
                students
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>
        ))}
      </div>

      {openClass && (
        <RosterDrawer
          cls={openClass}
          students={students?.filter((s) => s.section === openClass.section) ?? []}
          onClose={() => setOpenClass(null)}
        />
      )}
    </>
  )
}

function RosterDrawer({
  cls, students, onClose,
}: { cls: TeacherClass; students: Student[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/40">
      <div className="absolute inset-0" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-violet-600">
              {cls.section}
            </div>
            <h3 className="mt-1 text-lg font-semibold">{cls.subject}</h3>
            <div className="text-xs text-slate-500">{cls.days} · {cls.time} · {cls.room}</div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Roster ({students.length})
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">No students enrolled in this section yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {initials(`${s.firstName} ${s.lastName}`)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">
                      {s.lastName}, {s.firstName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {s.studentNumber}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
