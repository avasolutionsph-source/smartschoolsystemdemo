import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, X } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { computePayslip, deductionsFor } from '@/lib/hrHelpers'
import { formatDate, formatPHP, initials } from '@/lib/utils'
import type { Employee } from '@/types'

export default function Employees() {
  const employees = useLiveQuery(() => db.employees.toArray(), [])
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [open, setOpen] = useState<Employee | null>(null)

  const departments = useMemo(() => {
    const set = new Set<string>()
    employees?.forEach((e) => set.add(e.department))
    return Array.from(set).sort()
  }, [employees])

  const filtered = useMemo(() => {
    if (!employees) return []
    let list = employees
    if (deptFilter !== 'all') list = list.filter((e) => e.department === deptFilter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q) ||
          e.employeeNumber.toLowerCase().includes(q),
      )
    }
    return list
  }, [employees, query, deptFilter])

  return (
    <>
      <PageHeader title="Employees" subtitle="Master 201 list of teaching and non-teaching staff." />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, position, employee #…"
              className="input pl-9"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="all">All departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <div className="ml-auto text-xs text-slate-500">
            {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Employee #</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Hired</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setOpen(e)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-600">{e.employeeNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {e.lastName}, {e.firstName}
                  </td>
                  <td className="px-4 py-3">{e.position}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-teal-50 text-teal-700">{e.department}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(e.hiredAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                    No employees match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && <ProfileDrawer emp={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function ProfileDrawer({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const slip = computePayslip(emp)
  const breakdown = deductionsFor(slip.basic)
  const slips = useLiveQuery(
    () => db.payslips.where('employeeId').equals(emp.id).toArray(),
    [emp.id],
  )

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/40">
      <div className="absolute inset-0" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-base font-semibold text-teal-700">
              {initials(`${emp.firstName} ${emp.lastName}`)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{emp.firstName} {emp.lastName}</h3>
              <div className="text-xs text-slate-500">
                {emp.employeeNumber} · {emp.position} · {emp.department}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <Section title="Employment">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" value={emp.email} />
              <Field label="Hired" value={formatDate(emp.hiredAt)} />
              <Field label="Position" value={emp.position} />
              <Field label="Department" value={emp.department} />
            </div>
          </Section>

          <Section title="Salary Profile">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Basic" value={formatPHP(slip.basic)} />
              <Field label="Allowances" value={formatPHP(slip.allowances)} />
              <Field label="Total Deductions" value={formatPHP(slip.deductions)} />
              <Field label="Net Pay (Est.)" value={<span className="font-semibold text-emerald-700">{formatPHP(slip.net)}</span>} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <Mini label="SSS" value={breakdown.sss} />
              <Mini label="PhilHealth" value={breakdown.philhealth} />
              <Mini label="Pag-IBIG" value={breakdown.pagibig} />
              <Mini label="W/Tax" value={breakdown.wTax} />
            </div>
          </Section>

          <Section title="Payslip History">
            {slips && slips.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {slips.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-mono text-xs text-slate-500">{s.id}</span>
                    <span className="font-medium">{formatPHP(s.net)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No payslips on file yet.</p>
            )}
          </Section>
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm text-slate-800">{value}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{formatPHP(value)}</div>
    </div>
  )
}
