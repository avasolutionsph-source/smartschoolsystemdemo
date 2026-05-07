import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, ChevronLeft, ChevronRight, CreditCard, Printer, X } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { computePayslip, deductionsFor } from '@/lib/hrHelpers'
import { formatDate, formatDateTime, formatPHP } from '@/lib/utils'
import type { Employee, PayrollRun, Payslip } from '@/types'

export default function Payroll() {
  const runs = useLiveQuery(
    () => db.payrollRuns.orderBy('createdAt').reverse().toArray(),
    [],
  )
  const [wizardOpen, setWizardOpen] = useState(false)
  const [openRun, setOpenRun] = useState<PayrollRun | null>(null)

  return (
    <>
      <PageHeader
        title="Payroll"
        subtitle="Run cut-off payroll, preview computation, and release payslips."
        actions={
          <button onClick={() => setWizardOpen(true)} className="btn-primary">
            <CreditCard className="h-4 w-4" /> Run new payroll
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Period</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Released</th>
              <th className="px-4 py-3 text-right">Total Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs?.map((r) => (
              <tr
                key={r.id}
                onClick={() => setOpenRun(r)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge capitalize ${
                    r.status === 'released' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {r.releasedAt ? formatDate(r.releasedAt) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPHP(r.totalNet)}</td>
              </tr>
            ))}
            {runs?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-slate-500">
                  No payroll runs yet. Click <strong>Run new payroll</strong> to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {wizardOpen && <PayrollWizard onClose={() => setWizardOpen(false)} />}
      {openRun && <RunDetail run={openRun} onClose={() => setOpenRun(null)} />}
    </>
  )
}

function PayrollWizard({ onClose }: { onClose: () => void }) {
  const employees = useLiveQuery(() => db.employees.toArray(), [])
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  const [step, setStep] = useState(0)
  const [start, setStart] = useState(firstDay.toISOString().slice(0, 10))
  const [end, setEnd] = useState(lastDay.toISOString().slice(0, 10))
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [released, setReleased] = useState<PayrollRun | null>(null)

  const computed = useMemo(() => {
    if (!employees) return [] as Array<{ emp: Employee; basic: number; allowances: number; deductions: number; net: number }>
    return employees
      .filter((e) => !excluded.has(e.id))
      .map((emp) => ({ emp, ...computePayslip(emp) }))
  }, [employees, excluded])

  const totalNet = computed.reduce((s, p) => s + p.net, 0)
  const totalBasic = computed.reduce((s, p) => s + p.basic, 0)

  function toggle(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function release() {
    const runId = `run-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()
    const run: PayrollRun = {
      id: runId,
      periodStart: start,
      periodEnd: end,
      status: 'released',
      totalNet,
      releasedAt: now,
      createdAt: now,
    }
    const slips: Payslip[] = computed.map((p, i) => ({
      id: `slip-${runId}-${i + 1}`,
      runId,
      employeeId: p.emp.id,
      basic: p.basic,
      allowances: p.allowances,
      deductions: p.deductions,
      net: p.net,
    }))
    await db.payrollRuns.add(run)
    await db.payslips.bulkAdd(slips)
    setReleased(run)
  }

  if (released) {
    return (
      <Backdrop onClose={onClose}>
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <Check className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-semibold">Payroll released</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {computed.length} payslip{computed.length === 1 ? '' : 's'} generated for the period{' '}
            <strong>{formatDate(start)} – {formatDate(end)}</strong>.
          </p>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Total net released</span>
              <strong className="text-emerald-700">{formatPHP(totalNet)}</strong>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="btn-primary">Done</button>
          </div>
        </div>
      </Backdrop>
    )
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-base font-semibold">Run new payroll</h3>
            <p className="text-xs text-slate-500">Step {step + 1} of 3</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-800">Period</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start</label>
                  <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div>
                  <label className="label">End</label>
                  <input type="date" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                {employees?.length ?? 0} employees will be included by default. You can exclude individuals in the next step.
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">Inclusion list</h4>
                <span className="text-xs text-slate-500">
                  {(employees?.length ?? 0) - excluded.size} included · {excluded.size} excluded
                </span>
              </div>
              <ul className="max-h-[400px] space-y-1 overflow-y-auto">
                {employees?.map((e) => {
                  const inc = !excluded.has(e.id)
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => toggle(e.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                          inc ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white opacity-60'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-800">{e.lastName}, {e.firstName}</div>
                          <div className="text-xs text-slate-500">{e.position} · {e.department}</div>
                        </div>
                        {inc && <Check className="h-4 w-4 text-emerald-600" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-800">Computation preview</h4>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <Tile label="Employees" value={computed.length} />
                <Tile label="Total Basic" value={formatPHP(totalBasic)} />
                <Tile label="Total Net" value={formatPHP(totalNet)} accent="emerald" />
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-right">Basic</th>
                      <th className="px-3 py-2 text-right">Allow.</th>
                      <th className="px-3 py-2 text-right">Ded.</th>
                      <th className="px-3 py-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {computed.map((p) => (
                      <tr key={p.emp.id}>
                        <td className="px-3 py-1.5">{p.emp.lastName}, {p.emp.firstName}</td>
                        <td className="px-3 py-1.5 text-right">{formatPHP(p.basic)}</td>
                        <td className="px-3 py-1.5 text-right">{formatPHP(p.allowances)}</td>
                        <td className="px-3 py-1.5 text-right text-red-600">{formatPHP(p.deductions)}</td>
                        <td className="px-3 py-1.5 text-right font-semibold">{formatPHP(p.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-5">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-outline"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < 2 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={release} className="btn-primary">
              Release payroll
            </button>
          )}
        </div>
      </div>
    </Backdrop>
  )
}

function RunDetail({ run, onClose }: { run: PayrollRun; onClose: () => void }) {
  const slips = useLiveQuery(
    () => db.payslips.where('runId').equals(run.id).toArray(),
    [run.id],
  )
  const employees = useLiveQuery(() => db.employees.toArray(), [])
  const empMap = useMemo(() => {
    const m = new Map<string, Employee>()
    employees?.forEach((e) => m.set(e.id, e))
    return m
  }, [employees])

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-base font-semibold">
              Payroll · {formatDate(run.periodStart)} – {formatDate(run.periodEnd)}
            </h3>
            <p className="text-xs text-slate-500">
              {run.status === 'released' && run.releasedAt ? `Released ${formatDateTime(run.releasedAt)}` : 'Draft'}
              {' · '}{formatPHP(run.totalNet)} total net
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn-outline">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-right">Basic</th>
                <th className="px-4 py-2 text-right">Allowances</th>
                <th className="px-4 py-2 text-right">Deductions</th>
                <th className="px-4 py-2 text-right">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slips?.map((s) => {
                const e = empMap.get(s.employeeId)
                const breakdown = deductionsFor(s.basic)
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-2">
                      <div className="font-medium">{e ? `${e.lastName}, ${e.firstName}` : s.employeeId}</div>
                      <div className="text-xs text-slate-500">{e?.position} · {e?.department}</div>
                    </td>
                    <td className="px-4 py-2 text-right">{formatPHP(s.basic)}</td>
                    <td className="px-4 py-2 text-right">{formatPHP(s.allowances)}</td>
                    <td className="px-4 py-2 text-right text-red-600" title={`SSS ${breakdown.sss} · PH ${breakdown.philhealth} · HDMF ${breakdown.pagibig} · Tax ${breakdown.wTax}`}>
                      {formatPHP(s.deductions)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">{formatPHP(s.net)}</td>
                  </tr>
                )
              })}
              {slips?.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No payslips.</td></tr>
              )}
            </tbody>
          </table>
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

function Tile({ label, value, accent = 'slate' }: { label: string; value: string | number; accent?: 'slate' | 'emerald' }) {
  const cls = accent === 'emerald' ? 'text-emerald-700' : 'text-slate-900'
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
