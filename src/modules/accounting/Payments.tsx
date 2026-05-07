import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatDate, formatPHP } from '@/lib/utils'
import { CASH_METHODS, isCashMethod } from '@/lib/financeHelpers'
import type { PaymentMethod, Student } from '@/types'
import { PostPaymentDialog } from './PostPaymentDialog'

const METHOD_COLOR: Record<PaymentMethod, string> = {
  cash: 'bg-emerald-50 text-emerald-700',
  bank: 'bg-blue-50 text-blue-700',
  online: 'bg-violet-50 text-violet-700',
  discount: 'bg-amber-50 text-amber-700',
  scholarship: 'bg-pink-50 text-pink-700',
}

export default function Payments() {
  const payments = useLiveQuery(
    () => db.payments.orderBy('postedAt').reverse().toArray(),
    [],
  )
  const students = useLiveQuery(() => db.students.toArray(), [])

  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all')
  const [pickOpen, setPickOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [postOpen, setPostOpen] = useState(false)

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>()
    students?.forEach((s) => m.set(s.id, s))
    return m
  }, [students])

  const filtered = useMemo(() => {
    if (!payments) return []
    let list = payments
    if (methodFilter !== 'all') list = list.filter((p) => p.method === methodFilter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((p) => {
        const s = studentMap.get(p.studentId)
        if (p.orNumber.toLowerCase().includes(q)) return true
        if (s && (
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q)
        )) return true
        return false
      })
    }
    return list
  }, [payments, methodFilter, query, studentMap])

  const totals = useMemo(() => {
    const cash = filtered.filter((p) => isCashMethod(p.method)).reduce((s, p) => s + p.amount, 0)
    const credits = filtered.filter((p) => !isCashMethod(p.method)).reduce((s, p) => s + p.amount, 0)
    return { cash, credits, count: filtered.length }
  }, [filtered])

  function startPost(s: Student) {
    setSelectedStudent(s)
    setPickOpen(false)
    setPostOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Every transaction posted by Accounting."
        actions={
          <button onClick={() => setPickOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Post payment
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Filtered Records" value={totals.count} />
        <Stat label="Cash Total" value={formatPHP(totals.cash)} accent="emerald" />
        <Stat label="Credits Total" value={formatPHP(totals.credits)} accent="violet" />
      </div>

      <div className="mt-4 card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search OR #, student name…"
              className="input pl-9"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
            className="input max-w-[180px] capitalize"
          >
            <option value="all">All methods</option>
            {(['cash', 'bank', 'online', 'discount', 'scholarship'] as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">OR #</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Remarks</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const s = studentMap.get(p.studentId)
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{p.orNumber}</td>
                    <td className="px-4 py-3">
                      {s ? (
                        <>
                          <div className="font-medium text-slate-800">{s.lastName}, {s.firstName}</div>
                          <div className="text-xs text-slate-500">{s.studentNumber}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge capitalize', METHOD_COLOR[p.method])}>
                        {p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.postedAt)}</td>
                    <td className="px-4 py-3 text-slate-500">{p.remarks ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPHP(p.amount)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pickOpen && (
        <StudentPicker
          students={students ?? []}
          onPick={startPost}
          onClose={() => setPickOpen(false)}
        />
      )}

      {postOpen && selectedStudent && (
        <PostPaymentDialog
          student={selectedStudent}
          onClose={() => setPostOpen(false)}
        />
      )}
    </>
  )
}

function StudentPicker({
  students, onPick, onClose,
}: { students: Student[]; onPick: (s: Student) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return students.slice(0, 30)
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(t) ||
        s.lastName.toLowerCase().includes(t) ||
        s.studentNumber.toLowerCase().includes(t),
    )
  }, [q, students])

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
        <h3 className="text-sm font-semibold">Pick student</h3>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="input pl-9"
          />
        </div>
        <ul className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto">
          {list.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => onPick(s)}
                className="w-full px-2 py-2 text-left text-sm hover:bg-slate-50"
              >
                <div className="font-medium text-slate-800">{s.lastName}, {s.firstName}</div>
                <div className="text-xs text-slate-500">{s.studentNumber} · {s.section}</div>
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="py-6 text-center text-xs text-slate-400">No match</li>
          )}
        </ul>
      </div>
    </div>
  )
}

function Stat({ label, value, accent = 'slate' }: { label: string; value: number | string; accent?: 'slate' | 'emerald' | 'violet' }) {
  const cls = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
  }[accent]
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
