import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, Lock, Unlock } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatDate } from '@/lib/utils'
import type { Grade, Student } from '@/types'

export default function GradesLock() {
  const grades = useLiveQuery(() => db.grades.toArray(), [])
  const students = useLiveQuery(() => db.students.toArray(), [])
  const [filter, setFilter] = useState<'all' | 'pending' | 'locked'>('pending')
  const [flash, setFlash] = useState<string | null>(null)

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>()
    students?.forEach((s) => m.set(s.id, s))
    return m
  }, [students])

  const grouped = useMemo(() => {
    if (!grades) return new Map<string, Grade[]>()
    const m = new Map<string, Grade[]>()
    for (const g of grades) {
      if (filter === 'pending' && g.status !== 'pending') continue
      if (filter === 'locked' && g.status !== 'locked') continue
      const key = `${g.subject}|||${g.term}|||${g.classId ?? '-'}`
      const arr = m.get(key) ?? []
      arr.push(g)
      m.set(key, arr)
    }
    return m
  }, [grades, filter])

  const pendingCount = grades?.filter((g) => g.status === 'pending').length ?? 0
  const lockedCount = grades?.filter((g) => g.status === 'locked').length ?? 0

  async function lockBatch(batch: Grade[]) {
    if (batch.length === 0) return
    const confirmMsg = `Lock ${batch.length} grade${batch.length === 1 ? '' : 's'}? Students will see their grades immediately.`
    if (!confirm(confirmMsg)) return
    await db.grades.bulkPut(batch.map((g) => ({ ...g, status: 'locked' as const })))
    setFlash(`${batch.length} grade${batch.length === 1 ? '' : 's'} locked`)
    setTimeout(() => setFlash(null), 2500)
  }

  async function unlockBatch(batch: Grade[]) {
    if (batch.length === 0) return
    if (!confirm(`Unlock ${batch.length} grade${batch.length === 1 ? '' : 's'}?`)) return
    await db.grades.bulkPut(batch.map((g) => ({ ...g, status: 'pending' as const })))
    setFlash(`${batch.length} grade${batch.length === 1 ? '' : 's'} unlocked`)
    setTimeout(() => setFlash(null), 2500)
  }

  return (
    <>
      <PageHeader
        title="Grades Lock-in"
        subtitle="Review teacher submissions and release them to students."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Pending Submissions" value={pendingCount} accent="amber" />
        <Stat label="Locked Grades" value={lockedCount} accent="emerald" />
        <Stat label="Total Records" value={grades?.length ?? 0} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(['pending', 'locked', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium capitalize',
                filter === f ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        {flash && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> {flash}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {Array.from(grouped.entries()).map(([key, items]) => {
          const [subject, term] = key.split('|||')
          const isPending = items[0].status === 'pending'
          return (
            <div key={key} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{subject}</div>
                  <div className="text-xs text-slate-500">{term} · {items.length} student{items.length === 1 ? '' : 's'}</div>
                </div>
                <div className="flex gap-2">
                  {isPending ? (
                    <button onClick={() => lockBatch(items)} className="btn-primary">
                      <Lock className="h-4 w-4" /> Lock all
                    </button>
                  ) : (
                    <button onClick={() => unlockBatch(items)} className="btn-outline">
                      <Unlock className="h-4 w-4" /> Unlock all
                    </button>
                  )}
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-2 text-left">Student</th>
                    <th className="px-5 py-2 text-left">Student #</th>
                    <th className="px-5 py-2 text-right">Grade</th>
                    <th className="px-5 py-2 text-right">Submitted</th>
                    <th className="px-5 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((g) => {
                    const s = studentMap.get(g.studentId)
                    return (
                      <tr key={g.id}>
                        <td className="px-5 py-2 font-medium text-slate-800">
                          {s ? `${s.lastName}, ${s.firstName}` : g.studentId}
                        </td>
                        <td className="px-5 py-2 text-slate-500">{s?.studentNumber ?? '—'}</td>
                        <td className="px-5 py-2 text-right font-semibold">{g.grade}</td>
                        <td className="px-5 py-2 text-right text-slate-500">{formatDate(g.submittedAt)}</td>
                        <td className="px-5 py-2 text-right">
                          <span className={cn(
                            'badge capitalize',
                            g.status === 'locked' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                          )}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
        {grouped.size === 0 && (
          <div className="card p-12 text-center text-sm text-slate-500">
            Nothing to show under this filter.
          </div>
        )}
      </div>
    </>
  )
}

function Stat({ label, value, accent = 'slate' }: { label: string; value: number; accent?: 'slate' | 'amber' | 'emerald' }) {
  const cls = {
    slate: 'text-slate-900',
    amber: 'text-amber-700',
    emerald: 'text-emerald-700',
  }[accent]
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
