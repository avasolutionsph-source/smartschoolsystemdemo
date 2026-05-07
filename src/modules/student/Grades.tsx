import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { currentStudentId } from '@/lib/studentHelpers'
import { cn } from '@/lib/utils'

export default function StudentGrades() {
  const sid = currentStudentId()
  const grades = useLiveQuery(
    () => db.grades.where('studentId').equals(sid).toArray(),
    [sid],
  )

  const visible = (grades ?? []).filter((g) => g.status === 'locked')
  const pendingCount = (grades ?? []).filter((g) => g.status === 'pending').length

  const avg = visible.length
    ? Math.round(visible.reduce((s, g) => s + g.grade, 0) / visible.length)
    : null

  return (
    <>
      <PageHeader
        title="My Grades"
        subtitle="Only registrar-locked grades are shown. Pending grades remain hidden until released."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Subjects Released" value={visible.length} />
        <Stat label="Pending" value={pendingCount} />
        <Stat label="Term Average" value={avg ?? '—'} />
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Term</th>
              <th className="px-4 py-3 text-right">Grade</th>
              <th className="px-4 py-3 text-right">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{g.subject}</td>
                <td className="px-4 py-3">{g.term}</td>
                <td className="px-4 py-3 text-right font-semibold">{g.grade}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      'badge',
                      g.grade >= 90 ? 'bg-emerald-50 text-emerald-700'
                      : g.grade >= 75 ? 'bg-blue-50 text-blue-700'
                      : 'bg-red-50 text-red-700',
                    )}
                  >
                    {g.grade >= 90 ? 'Excellent' : g.grade >= 75 ? 'Passing' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-slate-500">
                  No grades released yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}
