import { useLiveQuery } from 'dexie-react-hooks'
import { Printer } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { currentStudentId } from '@/lib/studentHelpers'
import { formatDate, formatPHP } from '@/lib/utils'

export default function StudentSOA() {
  const sid = currentStudentId()
  const student = useLiveQuery(() => db.students.get(sid), [sid])
  const payments = useLiveQuery(
    () =>
      db.payments
        .where('studentId').equals(sid)
        .reverse().sortBy('postedAt'),
    [sid],
  )

  if (!student) {
    return <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
  }

  const paid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const balance = student.assessment - paid
  const fullyPaid = balance <= 0

  return (
    <>
      <PageHeader
        title="Statement of Account"
        subtitle="Live view of your tuition assessment and payment history."
        actions={
          <button onClick={() => window.print()} className="btn-outline">
            <Printer className="h-4 w-4" /> Print
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Tile label="Total Assessment" value={formatPHP(student.assessment)} />
        <Tile label="Total Payments" value={formatPHP(paid)} accent="emerald" />
        <Tile
          label="Balance"
          value={formatPHP(balance)}
          accent={fullyPaid ? 'emerald' : 'red'}
        />
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-800">Payment History</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">OR #</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Method</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{p.orNumber}</td>
                <td className="px-4 py-3">{formatDate(p.postedAt)}</td>
                <td className="px-4 py-3 capitalize">{p.method}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPHP(p.amount)}</td>
              </tr>
            ))}
            {payments?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-slate-500">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
          {payments && payments.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                <td className="px-4 py-3 text-right">{formatPHP(paid)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        SOA reflects payments posted by the Accounting Office in real time.
      </p>
    </>
  )
}

function Tile({ label, value, accent = 'slate' }: { label: string; value: string; accent?: 'slate' | 'emerald' | 'red' }) {
  const cls = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    red: 'text-red-600',
  }[accent]
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
