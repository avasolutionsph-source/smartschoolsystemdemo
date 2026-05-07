import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  ArrowRight, GraduationCap, Megaphone, Sparkles, TrendingUp,
} from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import type { LeadStage } from '@/types'

const STAGE_ORDER: LeadStage[] = ['inquiry', 'contacted', 'toured', 'applied', 'enrolled', 'lost']

export default function MarketingDashboard() {
  const leads = useLiveQuery(() => db.leads.toArray(), [])

  const funnel = useMemo(() => {
    const m = new Map<LeadStage, number>()
    STAGE_ORDER.forEach((s) => m.set(s, 0))
    leads?.forEach((l) => m.set(l.stage, (m.get(l.stage) ?? 0) + 1))
    return STAGE_ORDER.map((s) => ({ stage: s, value: m.get(s) ?? 0 }))
  }, [leads])

  const total = leads?.length ?? 0
  const enrolled = funnel.find((f) => f.stage === 'enrolled')?.value ?? 0
  const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0

  const bySource = useMemo(() => {
    const m = new Map<string, number>()
    leads?.forEach((l) => m.set(l.source, (m.get(l.source) ?? 0) + 1))
    return Array.from(m, ([name, value]) => ({ name, value }))
  }, [leads])

  return (
    <>
      <PageHeader
        title="Marketing & Admissions"
        subtitle="Lead pipeline, conversion, and inquiry sources."
        actions={
          <Link to="/marketing/leads" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Open pipeline
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={total} icon={Megaphone} accent="pink" />
        <StatCard
          label="Active in Pipeline"
          value={total - enrolled - (funnel.find((f) => f.stage === 'lost')?.value ?? 0)}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard label="Enrolled" value={enrolled} icon={GraduationCap} accent="emerald" />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} accent="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Funnel by Stage</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} className="capitalize" />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Lead Source</h3>
            <Link to="/marketing/leads" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              Pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {bySource.map((s) => (
              <li key={s.name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <span className="capitalize">{s.name}</span>
                <span className="font-semibold">{s.value}</span>
              </li>
            ))}
            {bySource.length === 0 && (
              <li className="py-6 text-center text-xs text-slate-400">No leads yet.</li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
