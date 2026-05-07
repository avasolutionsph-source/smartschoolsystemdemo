import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { ArrowRight, FileText, GraduationCap, UserPlus, Users } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { formatDate } from '@/lib/utils'

export default function RegistrarDashboard() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const docs = useLiveQuery(
    () => db.documentRequests.orderBy('createdAt').reverse().toArray(),
    [],
  )

  const enrolled = students?.filter((s) => s.status === 'enrolled') ?? []
  const onLeave = students?.filter((s) => s.status === 'on-leave') ?? []
  const pendingDocs = docs?.filter((d) => d.status !== 'released').length ?? 0
  const readyForPickup = docs?.filter((d) => d.status === 'ready').length ?? 0

  const programData = (() => {
    const map = new Map<string, number>()
    enrolled.forEach((s) => map.set(s.program, (map.get(s.program) ?? 0) + 1))
    return Array.from(map, ([name, value]) => ({ name, value }))
  })()

  const recent = docs?.slice(0, 5) ?? []
  const recentEnrolled = students
    ?.slice()
    .sort((a, b) => +new Date(b.enrolledAt) - +new Date(a.enrolledAt))
    .slice(0, 5)

  return (
    <>
      <PageHeader
        title="Registrar Dashboard"
        subtitle="Enrollment health, document queue, and recent activity."
        actions={
          <Link to="/registrar/enrollment" className="btn-primary">
            <UserPlus className="h-4 w-4" /> New enrollment
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value={enrolled.length} icon={Users} accent="blue" />
        <StatCard label="On Leave" value={onLeave.length} icon={GraduationCap} accent="amber" />
        <StatCard label="Pending Documents" value={pendingDocs} icon={FileText} accent="violet" />
        <StatCard label="Ready for Pickup" value={readyForPickup} hint="Notify students" icon={FileText} accent="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Enrollment by Program</h3>
            <Link to="/registrar/students" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              View students <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={programData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1d4af5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent Document Requests</h3>
            <Link to="/registrar/documents" className="text-xs font-medium text-brand-600 hover:underline">
              See all
            </Link>
          </div>
          <ul className="space-y-2">
            {recent.map((d) => (
              <li key={d.id} className="rounded-lg border border-slate-100 p-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{d.documentType}</span>
                  <span className="badge bg-slate-100 text-slate-600 capitalize">{d.status}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-500">{d.purpose}</div>
                <div className="text-[11px] text-slate-400">{formatDate(d.createdAt)}</div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-6 text-center text-xs text-slate-400">No requests yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Recently Enrolled</h3>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="pb-2 text-left">Student #</th>
              <th className="pb-2 text-left">Name</th>
              <th className="pb-2 text-left">Program</th>
              <th className="pb-2 text-left">Section</th>
              <th className="pb-2 text-left">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentEnrolled?.map((s) => (
              <tr key={s.id}>
                <td className="py-2 text-slate-600">{s.studentNumber}</td>
                <td className="py-2 font-medium text-slate-800">
                  {s.lastName}, {s.firstName}
                </td>
                <td className="py-2">{s.program}</td>
                <td className="py-2">{s.section}</td>
                <td className="py-2 text-slate-500">{formatDate(s.enrolledAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
