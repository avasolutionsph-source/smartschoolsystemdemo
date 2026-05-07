import type { Employee } from '@/types'

const SALARY_BAND: Record<string, number> = {
  'Faculty': 32000,
  'Registrar Officer': 26000,
  'Accounting Officer': 28000,
  'Maintenance Staff': 18000,
  'Marketing Officer': 27000,
  'HR Officer': 28000,
  'IT Staff': 30000,
  'Guidance Counselor': 26000,
}

const ALLOWANCE_BY_DEPT: Record<string, number> = {
  'Academics': 2500,
  'Finance': 2000,
  'Operations': 1500,
  'Marketing': 2000,
  'Human Resources': 2000,
}

export function basicFor(emp: Employee) {
  return SALARY_BAND[emp.position] ?? 22000
}

export function allowanceFor(emp: Employee) {
  return ALLOWANCE_BY_DEPT[emp.department] ?? 1500
}

// Standard PH-style deductions (rough demo numbers)
export function deductionsFor(basic: number) {
  const sss = Math.round(basic * 0.045)
  const philhealth = Math.round(basic * 0.02)
  const pagibig = 100
  const wTax = Math.round(basic * 0.08)
  return { sss, philhealth, pagibig, wTax, total: sss + philhealth + pagibig + wTax }
}

export function computePayslip(emp: Employee) {
  const basic = basicFor(emp)
  const allowances = allowanceFor(emp)
  const dedTotal = deductionsFor(basic).total
  const net = basic + allowances - dedTotal
  return { basic, allowances, deductions: dedTotal, net }
}
