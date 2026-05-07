import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, Lock, Send } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { useSession } from '@/lib/store'
import { TEACHER_CLASSES, TERMS, gradeRemark } from '@/lib/teacherHelpers'
import { cn, initials } from '@/lib/utils'
import type { Grade } from '@/types'

export default function GradeEncoding() {
  const role = useSession((s) => s.role)
  const [classId, setClassId] = useState(TEACHER_CLASSES[0].id)
  const [term, setTerm] = useState(TERMS[0])
  const cls = TEACHER_CLASSES.find((c) => c.id === classId)!

  const students = useLiveQuery(
    () => db.students.where('section').equals(cls.section).toArray(),
    [cls.section],
  )

  // grades for this class+term — use studentId match since classId may not be on legacy seed records
  const existing = useLiveQuery(
    () =>
      db.grades
        .filter(
          (g) =>
            g.term === term &&
            (g.classId === classId || g.subject === cls.subject),
        )
        .toArray(),
    [classId, term, cls.subject],
  )

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savedFlash, setSavedFlash] = useState(false)

  // hydrate drafts from existing grades
  useEffect(() => {
    if (!existing) return
    const next: Record<string, string> = {}
    for (const g of existing) {
      next[g.studentId] = String(g.grade)
    }
    setDrafts(next)
  }, [existing, classId, term])

  const lockedByStudent = useMemo(() => {
    const m = new Map<string, Grade>()
    existing?.forEach((g) => {
      if (g.status === 'locked') m.set(g.studentId, g)
    })
    return m
  }, [existing])

  const pendingByStudent = useMemo(() => {
    const m = new Map<string, Grade>()
    existing?.forEach((g) => {
      if (g.status === 'pending') m.set(g.studentId, g)
    })
    return m
  }, [existing])

  const stats = useMemo(() => {
    const values = Object.values(drafts).map((v) => Number(v)).filter((n) => !Number.isNaN(n) && n > 0)
    if (values.length === 0) return { avg: '—', high: '—', low: '—', filled: 0 }
    return {
      avg: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
      high: Math.max(...values),
      low: Math.min(...values),
      filled: values.length,
    }
  }, [drafts])

  function setDraft(studentId: string, value: string) {
    if (lockedByStudent.has(studentId)) return
    setDrafts((d) => ({ ...d, [studentId]: value }))
  }

  async function submitForReview() {
    if (!students) return
    const now = new Date().toISOString()
    // Build new pending entries; replace any existing pending for same student+class+term
    const stale = (existing ?? []).filter((g) => g.status === 'pending')
    if (stale.length) await db.grades.bulkDelete(stale.map((g) => g.id))

    const records: Grade[] = []
    for (const s of students) {
      if (lockedByStudent.has(s.id)) continue
      const v = Number(drafts[s.id])
      if (Number.isNaN(v) || v <= 0) continue
      records.push({
        id: `grd-${classId}-${term}-${s.id}`,
        studentId: s.id,
        classId,
        subject: cls.subject,
        term,
        grade: v,
        status: 'pending',
        submittedBy: role,
        submittedAt: now,
      })
    }
    if (records.length) await db.grades.bulkAdd(records)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
  }

  return (
    <>
      <PageHeader
        title="Grade Encoding"
        subtitle="Encode grades per term. Submission queues them with the Registrar for lock-in."
      />

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
            <label className="label">Term</label>
            <select className="input" value={term} onChange={(e) => setTerm(e.target.value)}>
              {TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2 self-end">
            <Stat label="Avg" value={stats.avg} />
            <Stat label="High" value={stats.high} />
            <Stat label="Low" value={stats.low} />
          </div>
        </div>
      </div>

      <div className="mt-4 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="text-sm">
            <span className="font-semibold text-slate-800">{cls.subject}</span>
            <span className="text-slate-500"> · {cls.section} · {term}</span>
          </div>
          <div className="flex items-center gap-3">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Submitted to Registrar
              </span>
            )}
            <button onClick={submitForReview} className="btn-primary">
              <Send className="h-4 w-4" /> Submit for review
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Student #</th>
              <th className="px-4 py-2 text-center">Grade</th>
              <th className="px-4 py-2 text-right">Remark</th>
              <th className="px-4 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students?.map((s) => {
              const locked = lockedByStudent.get(s.id)
              const pending = pendingByStudent.get(s.id)
              const value = drafts[s.id] ?? ''
              const numeric = Number(value)
              const remark = !Number.isNaN(numeric) && numeric > 0 ? gradeRemark(numeric) : null
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {initials(`${s.firstName} ${s.lastName}`)}
                      </div>
                      <span className="font-medium text-slate-800">{s.lastName}, {s.firstName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{s.studentNumber}</td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={locked ? locked.grade : value}
                      onChange={(e) => setDraft(s.id, e.target.value)}
                      disabled={!!locked}
                      className={cn(
                        'w-20 rounded-md border px-2 py-1 text-center text-sm',
                        locked
                          ? 'border-slate-200 bg-slate-50 text-slate-500'
                          : 'border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
                      )}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    {remark && (
                      <span className={cn(
                        'badge',
                        remark.tone === 'good' ? 'bg-emerald-50 text-emerald-700'
                        : remark.tone === 'pass' ? 'bg-blue-50 text-blue-700'
                        : 'bg-red-50 text-red-700',
                      )}>
                        {remark.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {locked ? (
                      <span className="badge bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    ) : pending ? (
                      <span className="badge bg-amber-50 text-amber-700">Pending</span>
                    ) : value ? (
                      <span className="badge bg-slate-100 text-slate-600">Draft</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {students?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  No students in this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Locked grades are read-only. To correct a locked grade, request the Registrar to unlock first.
      </p>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
}
