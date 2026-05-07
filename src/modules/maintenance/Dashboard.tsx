import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts'
import { ArrowRight, BadgeCheck, KanbanSquare, Wrench } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { formatDate } from '@/lib/utils'

const PIE_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#94a3b8']

export default function MaintenanceDashboard() {
  const tickets = useLiveQuery(
    () => db.tickets.orderBy('createdAt').reverse().toArray(),
    [],
  )
  const assets = useLiveQuery(() => db.assets.toArray(), [])

  const open = (tickets ?? []).filter((t) => t.status !== 'verified' && t.status !== 'done').length
  const completed = (tickets ?? []).filter((t) => t.status === 'verified' || t.status === 'done').length

  const byCategory = useMemo(() => {
    const m = new Map<string, number>()
    tickets?.forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + 1))
    return Array.from(m, ([name, value]) => ({ name, value }))
  }, [tickets])

  const recent = (tickets ?? []).slice(0, 5)

  return (
    <>
      <PageHeader
        title="Maintenance & Operations"
        subtitle="Tickets, assets, and facility status."
        actions={
          <Link to="/maintenance/tickets" className="btn-primary">
            <KanbanSquare className="h-4 w-4" /> Manage tickets
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Tickets" value={open} icon={Wrench} accent="amber" />
        <StatCard label="Completed" value={completed} icon={BadgeCheck} accent="emerald" />
        <StatCard label="Total Assets" value={assets?.length ?? 0} icon={Wrench} accent="blue" />
        <StatCard
          label="Assets in Maintenance"
          value={(assets ?? []).filter((a) => a.status === 'maintenance').length}
          icon={Wrench}
          accent="violet"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Tickets by Category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent Tickets</h3>
            <Link to="/maintenance/tickets" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map((t) => (
              <li key={t.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{t.title}</div>
                    <div className="text-xs text-slate-500 capitalize">{t.category} · {formatDate(t.createdAt)}</div>
                  </div>
                  <span className={`badge capitalize ${
                    t.status === 'verified' ? 'bg-emerald-50 text-emerald-700'
                    : t.status === 'done' ? 'bg-blue-50 text-blue-700'
                    : t.status === 'in-progress' ? 'bg-violet-50 text-violet-700'
                    : t.status === 'assigned' ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
