import { useLiveQuery } from 'dexie-react-hooks'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  CreditCard, GraduationCap, Megaphone, ShieldCheck, Users, Wrench,
} from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { formatDate, formatPHP } from '@/lib/utils'

const PIE_COLORS = ['#1d4af5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const employees = useLiveQuery(() => db.employees.toArray(), [])
  const tickets = useLiveQuery(() => db.tickets.toArray(), [])
  const payments = useLiveQuery(() => db.payments.toArray(), [])
  const announcements = useLiveQuery(
    () => db.announcements.orderBy('createdAt').reverse().limit(5).toArray(),
    [],
  )
  const grades = useLiveQuery(() => db.grades.toArray(), [])

  const enrolledCount = students?.filter((s) => s.status === 'enrolled').length ?? 0
  const collections = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const openTickets = tickets?.filter((t) => t.status !== 'verified' && t.status !== 'done').length ?? 0
  const pendingGrades = grades?.filter((g) => g.status === 'pending').length ?? 0

  const programData = (() => {
    const map = new Map<string, number>()
    students?.forEach((s) => map.set(s.program, (map.get(s.program) ?? 0) + 1))
    return Array.from(map, ([name, value]) => ({ name, value }))
  })()

  const ticketStatusData = (() => {
    const map = new Map<string, number>()
    tickets?.forEach((t) => map.set(t.status, (map.get(t.status) ?? 0) + 1))
    return Array.from(map, ([name, value]) => ({ name, value }))
  })()

  return (
    <>
      <PageHeader
        title="School-wide Dashboard"
        subtitle="Cross-office snapshot of enrollment, finance, and operations."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enrolled Students"
          value={enrolledCount}
          hint={`${students?.length ?? 0} total records`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Total Collections"
          value={formatPHP(collections)}
          hint={`${payments?.length ?? 0} payments posted`}
          icon={CreditCard}
          accent="emerald"
        />
        <StatCard
          label="Open Tickets"
          value={openTickets}
          hint={`${tickets?.length ?? 0} all-time`}
          icon={Wrench}
          accent="amber"
        />
        <StatCard
          label="Pending Grades"
          value={pendingGrades}
          hint="Awaiting registrar lock"
          icon={GraduationCap}
          accent="violet"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Enrollment by Program</h3>
            <span className="badge bg-blue-50 text-blue-700">Live</span>
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
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Maintenance Tickets</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {ticketStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Recent Announcements</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {announcements?.map((a) => (
              <li key={a.id} className="py-3">
                <div className="text-sm font-medium text-slate-800">{a.title}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{a.body}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {formatDate(a.createdAt)} · {a.audiences.join(', ')}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">System Snapshot</h3>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Employees</dt>
              <dd className="mt-1 text-lg font-semibold">{employees?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Programs</dt>
              <dd className="mt-1 text-lg font-semibold">{programData.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Active Sections</dt>
              <dd className="mt-1 text-lg font-semibold">
                {new Set(students?.map((s) => s.section)).size}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Announcements</dt>
              <dd className="mt-1 text-lg font-semibold">{announcements?.length ?? 0}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
