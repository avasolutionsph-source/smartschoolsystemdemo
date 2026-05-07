import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, X } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatDate, formatPHP, initials } from '@/lib/utils'
import type { Student, StudentStatus } from '@/types'

const STATUS_COLOR: Record<StudentStatus, string> = {
  enrolled: 'bg-emerald-50 text-emerald-700',
  'on-leave': 'bg-amber-50 text-amber-700',
  dropped: 'bg-red-50 text-red-700',
  graduated: 'bg-blue-50 text-blue-700',
  'transferred-out': 'bg-slate-100 text-slate-600',
}

export default function Students() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all')
  const [open, setOpen] = useState<Student | null>(null)

  const filtered = useMemo(() => {
    if (!students) return []
    let list = students
    if (statusFilter !== 'all') list = list.filter((s) => s.status === statusFilter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.section.toLowerCase().includes(q),
      )
    }
    return list
  }, [students, query, statusFilter])

  return (
    <>
      <PageHeader title="Students" subtitle="Master list of all student records." />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, student #, section…"
              className="input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StudentStatus | 'all')}
            className="input max-w-[180px]"
          >
            <option value="all">All statuses</option>
            <option value="enrolled">Enrolled</option>
            <option value="on-leave">On leave</option>
            <option value="dropped">Dropped</option>
            <option value="graduated">Graduated</option>
            <option value="transferred-out">Transferred</option>
          </select>
          <div className="ml-auto text-xs text-slate-500">
            {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Student #</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Program</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Section</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setOpen(s)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-600">{s.studentNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {s.lastName}, {s.firstName}
                  </td>
                  <td className="px-4 py-3">{s.program}</td>
                  <td className="px-4 py-3">Y{s.yearLevel}</td>
                  <td className="px-4 py-3">{s.section}</td>
                  <td className="px-4 py-3">
                    <span className={cn('badge capitalize', STATUS_COLOR[s.status])}>
                      {s.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(s.enrolledAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    No students match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && <ProfileDrawer student={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function ProfileDrawer({ student, onClose }: { student: Student; onClose: () => void }) {
  const payments = useLiveQuery(
    () => db.payments.where('studentId').equals(student.id).toArray(),
    [student.id],
  )
  const grades = useLiveQuery(
    () => db.grades.where('studentId').equals(student.id).toArray(),
    [student.id],
  )
  const docs = useLiveQuery(
    () => db.documentRequests.where('studentId').equals(student.id).toArray(),
    [student.id],
  )

  const paid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const balance = student.assessment - paid

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/40">
      <div className="absolute inset-0" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-base font-semibold text-brand-700">
              {initials(`${student.firstName} ${student.lastName}`)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {student.firstName} {student.middleName ? student.middleName[0] + '. ' : ''}
                {student.lastName}
              </h3>
              <div className="text-xs text-slate-500">{student.studentNumber} · {student.program} · {student.section}</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <Section title="Bio">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" value={student.email} />
              <Field label="Contact" value={student.contact ?? '—'} />
              <Field label="Address" value={student.address ?? '—'} />
              <Field label="Status" value={student.status.replace('-', ' ')} />
            </div>
          </Section>

          <Section title="Guardian">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" value={student.guardianName ?? '—'} />
              <Field label="Contact" value={student.guardianContact ?? '—'} />
            </div>
          </Section>

          <Section title="Finance">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Assessment" value={formatPHP(student.assessment)} />
              <Field label="Paid" value={formatPHP(paid)} />
              <Field
                label="Balance"
                value={
                  <span className={balance > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                    {formatPHP(balance)}
                  </span>
                }
              />
            </div>
          </Section>

          <Section title="Grades">
            {grades && grades.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pb-2 text-left">Subject</th>
                    <th className="pb-2 text-left">Term</th>
                    <th className="pb-2 text-right">Grade</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((g) => (
                    <tr key={g.id}>
                      <td className="py-2">{g.subject}</td>
                      <td className="py-2">{g.term}</td>
                      <td className="py-2 text-right font-medium">{g.grade}</td>
                      <td className="py-2 text-right">
                        <span className={cn('badge capitalize', g.status === 'locked' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500">No grades on record yet.</p>
            )}
          </Section>

          <Section title="Document Requests">
            {docs && docs.length > 0 ? (
              <ul className="divide-y divide-slate-100 text-sm">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2">
                    <span>
                      <span className="font-medium">{d.documentType}</span>
                      <span className="ml-2 text-xs text-slate-500">{d.purpose}</span>
                    </span>
                    <span className="badge bg-slate-100 text-slate-600 capitalize">{d.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No requests on file.</p>
            )}
          </Section>
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm text-slate-800">{value}</div>
    </div>
  )
}
