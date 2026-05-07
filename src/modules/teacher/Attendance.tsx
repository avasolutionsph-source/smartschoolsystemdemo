import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, QrCode, Save, ScanLine } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { useSession } from '@/lib/store'
import { TEACHER_CLASSES, todayStr } from '@/lib/teacherHelpers'
import { cn, initials } from '@/lib/utils'
import type { AttendanceStatus, Student } from '@/types'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: 'present', label: 'Present', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'late', label: 'Late', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'excused', label: 'Excused', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'absent', label: 'Absent', tone: 'bg-red-50 text-red-700 border-red-200' },
]

export default function Attendance() {
  const role = useSession((s) => s.role)
  const [classId, setClassId] = useState(TEACHER_CLASSES[0].id)
  const [date, setDate] = useState(todayStr())
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({})
  const [savedFlash, setSavedFlash] = useState(false)
  const [qrMode, setQrMode] = useState(false)
  const [scanFlash, setScanFlash] = useState<string | null>(null)

  const cls = TEACHER_CLASSES.find((c) => c.id === classId)!
  const students = useLiveQuery(
    () => db.students.where('section').equals(cls.section).toArray(),
    [cls.section],
  )
  const existing = useLiveQuery(
    () =>
      db.attendance
        .where('classId').equals(classId)
        .filter((r) => r.date === date)
        .toArray(),
    [classId, date],
  )

  // Hydrate marks from existing records
  useEffect(() => {
    if (!existing) return
    const next: Record<string, AttendanceStatus> = {}
    existing.forEach((r) => { next[r.studentId] = r.status })
    setMarks(next)
  }, [existing, classId, date])

  const summary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      present: 0, late: 0, excused: 0, absent: 0,
    }
    Object.values(marks).forEach((s) => { counts[s]++ })
    return counts
  }, [marks])

  function setMark(studentId: string, status: AttendanceStatus) {
    setMarks((m) => ({ ...m, [studentId]: status }))
  }

  function markAll(status: AttendanceStatus) {
    if (!students) return
    const next: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { next[s.id] = status })
    setMarks(next)
  }

  function simulateScan() {
    if (!students || students.length === 0) return
    const unmarked = students.filter((s) => !marks[s.id] || marks[s.id] === 'absent')
    const pool = unmarked.length > 0 ? unmarked : students
    const picked = pool[Math.floor(Math.random() * pool.length)]
    setMarks((m) => ({ ...m, [picked.id]: 'present' }))
    setScanFlash(`${picked.firstName} ${picked.lastName} checked in`)
    setTimeout(() => setScanFlash(null), 2500)
  }

  async function save() {
    if (!students) return
    const now = new Date().toISOString()

    // Remove old entries for this class+date to keep idempotent
    const stale = await db.attendance
      .where('classId').equals(classId)
      .filter((r) => r.date === date)
      .toArray()
    if (stale.length) await db.attendance.bulkDelete(stale.map((r) => r.id))

    // Insert new
    const records = Object.entries(marks).map(([studentId, status]) => ({
      id: `att-${classId}-${date}-${studentId}`,
      classId,
      studentId,
      date,
      status,
      postedBy: role,
      postedAt: now,
    }))
    if (records.length) await db.attendance.bulkAdd(records)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  return (
    <>
      <PageHeader
        title="Attendance Encoding"
        subtitle="Pick a class and date. Marks save to the central record — students see them in their portal."
        actions={
          <button
            onClick={() => setQrMode((q) => !q)}
            className={cn(qrMode ? 'btn-primary' : 'btn-outline')}
          >
            <QrCode className="h-4 w-4" /> {qrMode ? 'Manual mode' : 'QR check-in'}
          </button>
        }
      />

      {qrMode && (
        <div className="card mb-4 p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] items-center">
            <div className="mx-auto">
              <div className="grid h-44 w-44 place-items-center rounded-xl bg-slate-900 p-3">
                <QrPattern seed={`${classId}-${date}`} />
              </div>
              <div className="mt-2 text-center text-[10px] font-mono text-slate-500">
                {classId} · {date}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Live QR session</h3>
              <p className="mt-1 text-xs text-slate-600">
                Project this QR. Each student scans it once with the school app to record their attendance —
                no roll call needed.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={simulateScan} className="btn-primary">
                  <ScanLine className="h-4 w-4" /> Simulate student scan
                </button>
                {scanFlash && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> {scanFlash}
                  </span>
                )}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                Demo: clicking simulate marks a random unmarked student as Present. Real deployment will use the school app's camera.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="label">Class</label>
            <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {TEACHER_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>{c.subject} — {c.section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Session date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <div className="grid grid-cols-2 gap-1.5 text-xs w-full">
              <button onClick={() => markAll('present')} className="btn-outline border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                All present
              </button>
              <button onClick={() => markAll('absent')} className="btn-outline border-red-200 text-red-700 hover:bg-red-50">
                All absent
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-center md:grid-cols-4">
          {STATUS_OPTIONS.map((opt) => (
            <div key={opt.value} className={cn('rounded-lg border p-2', opt.tone)}>
              <div className="text-[11px] font-semibold uppercase tracking-wider">{opt.label}</div>
              <div className="text-lg font-bold">{summary[opt.value]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Roster ({students?.length ?? 0})
          </h3>
          <div className="flex items-center gap-3">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
            <button onClick={save} className="btn-primary">
              <Save className="h-4 w-4" /> Save attendance
            </button>
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {students?.map((s) => (
            <RosterRow
              key={s.id}
              student={s}
              status={marks[s.id]}
              onChange={(st) => setMark(s.id, st)}
            />
          ))}
          {students?.length === 0 && (
            <li className="py-8 text-center text-sm text-slate-500">No students in this section.</li>
          )}
        </ul>
      </div>
    </>
  )
}

function QrPattern({ seed }: { seed: string }) {
  // Deterministic 11×11 noise pattern based on seed (purely cosmetic)
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const cells: boolean[] = []
  for (let i = 0; i < 121; i++) {
    h = (h * 1664525 + 1013904223) >>> 0
    cells.push((h & 1) === 0)
  }
  return (
    <div className="grid h-full w-full grid-cols-11 grid-rows-11 gap-[2px] rounded-md bg-slate-900 p-1">
      {cells.map((on, i) => (
        <div key={i} className={on ? 'bg-white' : 'bg-slate-900'} />
      ))}
    </div>
  )
}

function RosterRow({
  student, status, onChange,
}: {
  student: Student
  status?: AttendanceStatus
  onChange: (s: AttendanceStatus) => void
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
        {initials(`${student.firstName} ${student.lastName}`)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium text-slate-800">
          {student.lastName}, {student.firstName}
        </div>
        <div className="truncate text-xs text-slate-500">{student.studentNumber}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium',
              status === opt.value
                ? opt.tone
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </li>
  )
}
