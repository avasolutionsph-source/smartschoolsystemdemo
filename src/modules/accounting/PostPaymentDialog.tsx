import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, Printer, X } from 'lucide-react'
import { db } from '@/mock/db'
import { useSession } from '@/lib/store'
import {
  CASH_METHODS, CREDIT_METHODS, balanceFor, nextOrNumber,
} from '@/lib/financeHelpers'
import { formatDateTime, formatPHP } from '@/lib/utils'
import type { Payment, PaymentMethod, Student } from '@/types'

interface Props {
  student: Student
  onClose: () => void
}

export function PostPaymentDialog({ student, onClose }: Props) {
  const role = useSession((s) => s.role)
  const allPayments = useLiveQuery(() => db.payments.toArray(), [])
  const studentPayments = useLiveQuery(
    () => db.payments.where('studentId').equals(student.id).toArray(),
    [student.id],
  )

  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState<string>('')
  const [orNumber, setOrNumber] = useState('')
  const [remarks, setRemarks] = useState('')
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState<Payment | null>(null)

  useEffect(() => {
    if (allPayments && !orNumber) setOrNumber(nextOrNumber(allPayments))
  }, [allPayments, orNumber])

  const balance = balanceFor(student, studentPayments)
  const isCash = CASH_METHODS.includes(method)
  const numAmount = Number(amount)
  const valid = !!amount && !Number.isNaN(numAmount) && numAmount > 0 && !!orNumber

  async function submit() {
    if (!valid) return
    setPosting(true)
    const payment: Payment = {
      id: `pay-${crypto.randomUUID().slice(0, 8)}`,
      studentId: student.id,
      amount: numAmount,
      method,
      orNumber,
      remarks: remarks.trim() || undefined,
      postedAt: new Date().toISOString(),
      postedBy: role,
    }
    await db.payments.add(payment)
    setPosting(false)
    setPosted(payment)
  }

  if (posted) {
    return (
      <Backdrop onClose={onClose}>
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-semibold">Payment posted</h3>
          </div>

          <div className="mt-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-slate-500">Official Receipt</div>
              <div className="mt-1 text-xl font-mono font-bold tracking-wider">{posted.orNumber}</div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm">
              <Row label="Student" value={`${student.firstName} ${student.lastName}`} />
              <Row label="Student #" value={student.studentNumber} />
              <Row label="Program" value={`${student.program} · ${student.section}`} />
              <Row label="Method" value={posted.method} cap />
              {posted.remarks && <Row label="Remarks" value={posted.remarks} />}
              <Row label="Date" value={formatDateTime(posted.postedAt)} />
              <hr className="border-slate-200" />
              <Row label="Amount" value={formatPHP(posted.amount)} bold />
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            The Student Portal SOA has been updated in real time.
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => window.print()} className="btn-outline">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={onClose} className="btn-primary">Done</button>
          </div>
        </div>
      </Backdrop>
    )
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">Post payment</h3>
            <p className="text-xs text-slate-500">
              {student.firstName} {student.lastName} · {student.studentNumber}
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Outstanding balance</span>
            <span className="text-base font-semibold text-slate-900">{formatPHP(balance)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">OR #</label>
              <input className="input font-mono" value={orNumber} onChange={(e) => setOrNumber(e.target.value)} />
            </div>
            <div>
              <label className="label">Method</label>
              <select
                className="input capitalize"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <optgroup label="Cash">
                  {CASH_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
                <optgroup label="Credit">
                  {CREDIT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">Remarks {!isCash && <span className="text-slate-400">(required for credits)</span>}</label>
            <input
              className="input"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={isCash ? 'Optional notes' : 'e.g. Academic Scholarship 50%'}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={submit} disabled={!valid || posting} className="btn-primary">
            {posting ? 'Posting…' : 'Post payment'}
          </button>
        </div>
      </div>
    </Backdrop>
  )
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative">{children}</div>
    </div>
  )
}

function Row({ label, value, bold, cap }: { label: string; value: string; bold?: boolean; cap?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
      <span className={`${bold ? 'text-base font-semibold' : ''} ${cap ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  )
}
