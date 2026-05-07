import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { isCashMethod } from '@/lib/financeHelpers'
import { formatPHP } from '@/lib/utils'

const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899']

export default function AccountingReports() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const payments = useLiveQuery(() => db.payments.toArray(), [])

  const collectionByProgram = useMemo(() => {
    if (!students || !payments) return []
    const studentMap = new Map<string, string>()
    students.forEach((s) => studentMap.set(s.id, s.program))
    const map = new Map<string, number>()
    for (const p of payments) {
      if (!isCashMethod(p.method)) continue
      const prog = studentMap.get(p.studentId)
      if (!prog) continue
      map.set(prog, (map.get(prog) ?? 0) + p.amount)
    }
    return Array.from(map, ([name, value]) => ({ name, value }))
  }, [students, payments])

  const arByProgram = useMemo(() => {
    if (!students || !payments) return []
    const paid = new Map<string, number>()
    for (const p of payments) {
      paid.set(p.studentId, (paid.get(p.studentId) ?? 0) + p.amount)
    }
    const map = new Map<string, number>()
    for (const s of students) {
      if (s.status !== 'enrolled') continue
      const bal = s.assessment - (paid.get(s.id) ?? 0)
      if (bal > 0) map.set(s.program, (map.get(s.program) ?? 0) + bal)
    }
    return Array.from(map, ([name, value]) => ({ name, value }))
  }, [students, payments])

  const aging = useMemo(() => {
    if (!students || !payments) return [
      { bucket: 'Current', value: 0 },
      { bucket: '1–30 days', value: 0 },
      { bucket: '31–60 days', value: 0 },
      { bucket: '60+ days', value: 0 },
    ]
    const paidByStudent = new Map<string, number>()
    const lastPayDate = new Map<string, string>()
    for (const p of payments) {
      if (!isCashMethod(p.method)) continue
      paidByStudent.set(p.studentId, (paidByStudent.get(p.studentId) ?? 0) + p.amount)
      const cur = lastPayDate.get(p.studentId)
      if (!cur || cur < p.postedAt) lastPayDate.set(p.studentId, p.postedAt)
    }
    const buckets = { Current: 0, '1–30 days': 0, '31–60 days': 0, '60+ days': 0 }
    const now = Date.now()
    for (const s of students) {
      if (s.status !== 'enrolled') continue
      const bal = s.assessment - (paidByStudent.get(s.id) ?? 0)
      if (bal <= 0) continue
      const refDate = lastPayDate.get(s.id) ?? s.enrolledAt
      const days = Math.floor((now - +new Date(refDate)) / 86400000)
      if (days <= 0) buckets.Current += bal
      else if (days <= 30) buckets['1–30 days'] += bal
      else if (days <= 60) buckets['31–60 days'] += bal
      else buckets['60+ days'] += bal
    }
    return Object.entries(buckets).map(([bucket, value]) => ({ bucket, value }))
  }, [students, payments])

  return (
    <>
      <PageHeader
        title="Accounting Reports"
        subtitle="Collections, AR, and aging — recomputed live from posted transactions."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Collections by Program">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={collectionByProgram}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {collectionByProgram.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatPHP(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Accounts Receivable by Program">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={arByProgram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatPHP(v)} />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="AR Aging" full>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={aging}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatPHP(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {aging.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}

function Card({ title, children, full = false }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`card p-5 ${full ? 'lg:col-span-2' : ''}`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}
