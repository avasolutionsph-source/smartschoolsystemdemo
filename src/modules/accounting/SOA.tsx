import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CreditCard, Printer, Search } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { balanceFor, totalsFor } from '@/lib/financeHelpers'
import { cn, formatDate, formatPHP } from '@/lib/utils'
import type { Student } from '@/types'
import { PostPaymentDialog } from './PostPaymentDialog'

export default function AccountingSOA() {
  const students = useLiveQuery(() => db.students.toArray(), [])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Student | null>(null)
  const [postOpen, setPostOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!students) return []
    const q = query.trim().toLowerCase()
    if (!q) return students.slice(0, 30)
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q),
    )
  }, [students, query])

  return (
    <>
      <PageHeader
        title="Statements of Account"
        subtitle="Pick a student to view their assessment, payments, and balance."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-1">
          <div className="border-b border-slate-200 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or student #"
                className="input pl-9"
              />
            </div>
          </div>
          <ul className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-slate-50',
                    selected?.id === s.id && 'bg-brand-50',
                  )}
                >
                  <div className="text-sm font-medium text-slate-800">
                    {s.lastName}, {s.firstName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.studentNumber} · {s.section}
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-slate-400">No match</li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <SOADetail
              student={selected}
              onPost={() => setPostOpen(true)}
            />
          ) : (
            <div className="card p-12 text-center text-sm text-slate-500">
              Select a student to view their SOA.
            </div>
          )}
        </div>
      </div>

      {postOpen && selected && (
        <PostPaymentDialog
          student={selected}
          onClose={() => setPostOpen(false)}
        />
      )}
    </>
  )
}

function SOADetail({ student, onPost }: { student: Student; onPost: () => void }) {
  const payments = useLiveQuery(
    () =>
      db.payments
        .where('studentId').equals(student.id)
        .reverse().sortBy('postedAt'),
    [student.id],
  )

  const balance = balanceFor(student, payments)
  const totals = totalsFor(payments)
  const cleared = balance <= 0

  return (
    <>
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {student.firstName} {student.lastName}
            </h3>
            <div className="text-xs text-slate-500">
              {student.studentNumber} · {student.program} · {student.section}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-outline">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={onPost} className="btn-primary">
              <CreditCard className="h-4 w-4" /> Post payment
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Assessment" value={formatPHP(student.assessment)} />
          <Tile label="Payments" value={formatPHP(totals.cash)} accent="emerald" />
          <Tile label="Credits" value={formatPHP(totals.credits)} accent="violet" />
          <Tile
            label="Balance"
            value={formatPHP(balance)}
            accent={cleared ? 'emerald' : 'red'}
          />
        </div>

        {cleared && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            ✓ Financial clearance: this student is fully paid.
          </div>
        )}
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3">
          <h4 className="text-sm font-semibold text-slate-800">Ledger</h4>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">OR #</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Remarks</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-mono text-xs">{p.orNumber}</td>
                <td className="px-4 py-2">{formatDate(p.postedAt)}</td>
                <td className="px-4 py-2 capitalize">{p.method}</td>
                <td className="px-4 py-2 text-slate-500">{p.remarks ?? '—'}</td>
                <td className="px-4 py-2 text-right font-medium">{formatPHP(p.amount)}</td>
              </tr>
            ))}
            {payments?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Tile({ label, value, accent = 'slate' }: { label: string; value: string; accent?: 'slate' | 'emerald' | 'violet' | 'red' }) {
  const cls = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
    red: 'text-red-600',
  }[accent]
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
