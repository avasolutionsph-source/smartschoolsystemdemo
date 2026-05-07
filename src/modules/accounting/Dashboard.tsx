import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertCircle, ArrowRight, BadgeCheck, CreditCard, ScrollText, TrendingUp,
} from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { CASH_METHODS, isCashMethod } from '@/lib/financeHelpers'
import { formatDate, formatPHP } from '@/lib/utils'

export default function AccountingDashboard() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const payments = useLiveQuery(
    () => db.payments.orderBy('postedAt').toArray(),
    [],
  )

  const collections = useMemo(() => {
    return (payments ?? [])
      .filter((p) => isCashMethod(p.method))
      .reduce((s, p) => s + p.amount, 0)
  }, [payments])

  const balances = useMemo(() => {
    if (!students || !payments) return { totalAR: 0, withBalance: 0, fullyPaid: 0 }
    const byStudent = new Map<string, number>()
    for (const p of payments) {
      byStudent.set(p.studentId, (byStudent.get(p.studentId) ?? 0) + p.amount)
    }
    let totalAR = 0
    let withBalance = 0
    let fullyPaid = 0
    for (const s of students) {
      if (s.status !== 'enrolled') continue
      const paid = byStudent.get(s.id) ?? 0
      const bal = s.assessment - paid
      if (bal > 0) {
        totalAR += bal
        withBalance++
      } else {
        fullyPaid++
      }
    }
    return { totalAR, withBalance, fullyPaid }
  }, [students, payments])

  const last7Days = useMemo(() => {
    const buckets: Record<string, number> = {}
    const labels: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      labels.push(key)
      buckets[key] = 0
    }
    for (const p of payments ?? []) {
      if (!isCashMethod(p.method)) continue
      const key = p.postedAt.slice(0, 10)
      if (key in buckets) buckets[key] += p.amount
    }
    return labels.map((d) => ({
      date: new Date(d).toLocaleDateString('en-PH', { weekday: 'short' }),
      amount: buckets[d],
    }))
  }, [payments])

  const byMethod = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of payments ?? []) {
      if (!isCashMethod(p.method)) continue
      map.set(p.method, (map.get(p.method) ?? 0) + p.amount)
    }
    return CASH_METHODS.map((m) => ({
      method: m,
      amount: map.get(m) ?? 0,
    }))
  }, [payments])

  const recent = (payments ?? []).slice(-5).reverse()
  const studentMap = useMemo(() => {
    const m = new Map<string, string>()
    students?.forEach((s) => m.set(s.id, `${s.lastName}, ${s.firstName}`))
    return m
  }, [students])

  return (
    <>
      <PageHeader
        title="Accounting Dashboard"
        subtitle="Collections, accounts receivable, and recent payments."
        actions={
          <Link to="/accounting/payments" className="btn-primary">
            <CreditCard className="h-4 w-4" /> Post payment
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Collections" value={formatPHP(collections)} icon={TrendingUp} accent="emerald" />
        <StatCard label="Accounts Receivable" value={formatPHP(balances.totalAR)} icon={AlertCircle} accent="amber" />
        <StatCard label="Students with Balance" value={balances.withBalance} icon={ScrollText} accent="violet" />
        <StatCard label="Fully Paid" value={balances.fullyPaid} hint="Financial cleared" icon={BadgeCheck} accent="blue" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Collections — Last 7 days</h3>
            <span className="badge bg-emerald-50 text-emerald-700">Cash + Bank + Online</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="emeraldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatPHP(v)} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#emeraldFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Collections by Method</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byMethod}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="method" tick={{ fontSize: 12 }} className="capitalize" />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatPHP(v)} />
                <Bar dataKey="amount" fill="#1d4af5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Recent Payments</h3>
          <Link to="/accounting/payments" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="pb-2 text-left">OR #</th>
              <th className="pb-2 text-left">Student</th>
              <th className="pb-2 text-left">Method</th>
              <th className="pb-2 text-left">Date</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((p) => (
              <tr key={p.id}>
                <td className="py-2 font-mono text-xs">{p.orNumber}</td>
                <td className="py-2 font-medium text-slate-800">{studentMap.get(p.studentId) ?? '—'}</td>
                <td className="py-2 capitalize">{p.method}</td>
                <td className="py-2 text-slate-500">{formatDate(p.postedAt)}</td>
                <td className="py-2 text-right font-medium">{formatPHP(p.amount)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-500">No payments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
