import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Briefcase, ArrowRight, CreditCard, FileSpreadsheet, Users } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { computePayslip } from '@/lib/hrHelpers'
import { formatDate, formatPHP } from '@/lib/utils'

export default function HRDashboard() {
  const employees = useLiveQuery(() => db.employees.toArray(), [])
  const runs = useLiveQuery(() => db.payrollRuns.orderBy('createdAt').reverse().toArray(), [])

  const headcountByDept = useMemo(() => {
    const m = new Map<string, number>()
    employees?.forEach((e) => m.set(e.department, (m.get(e.department) ?? 0) + 1))
    return Array.from(m, ([name, value]) => ({ name, value }))
  }, [employees])

  const monthlyPayrollEstimate = useMemo(() => {
    if (!employees) return 0
    return employees.reduce((sum, e) => sum + computePayslip(e).net, 0)
  }, [employees])

  return (
    <>
      <PageHeader
        title="HR & Payroll"
        subtitle="Workforce, payroll, and attendance overview."
        actions={
          <Link to="/hr/payroll" className="btn-primary">
            <CreditCard className="h-4 w-4" /> Run payroll
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employees" value={employees?.length ?? 0} icon={Users} accent="blue" />
        <StatCard label="Departments" value={headcountByDept.length} icon={Briefcase} accent="violet" />
        <StatCard
          label="Estimated Net (Month)"
          value={formatPHP(monthlyPayrollEstimate)}
          hint="Based on current band"
          icon={FileSpreadsheet}
          accent="emerald"
        />
        <StatCard
          label="Payroll Runs"
          value={runs?.length ?? 0}
          icon={CreditCard}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Headcount by Department</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={headcountByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent Payroll Runs</h3>
            <Link to="/hr/payroll" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {runs && runs.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {runs.slice(0, 5).map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                      </div>
                      <div className="text-xs text-slate-500">{formatPHP(r.totalNet)} total net</div>
                    </div>
                    <span className={`badge capitalize ${
                      r.status === 'released' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-slate-400">No payroll runs yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
