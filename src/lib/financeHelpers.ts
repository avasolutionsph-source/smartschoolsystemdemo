import type { Payment, Student } from '@/types'

export const CASH_METHODS: Payment['method'][] = ['cash', 'bank', 'online']
export const CREDIT_METHODS: Payment['method'][] = ['discount', 'scholarship']

export function isCashMethod(m: Payment['method']) {
  return CASH_METHODS.includes(m)
}

export function balanceFor(student: Student, payments: Payment[] | undefined) {
  const total = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)
  return student.assessment - total
}

export function totalsFor(payments: Payment[] | undefined) {
  const cash = (payments ?? [])
    .filter((p) => isCashMethod(p.method))
    .reduce((s, p) => s + p.amount, 0)
  const credits = (payments ?? [])
    .filter((p) => !isCashMethod(p.method))
    .reduce((s, p) => s + p.amount, 0)
  return { cash, credits, total: cash + credits }
}

export function nextOrNumber(existing: Payment[] | undefined) {
  let max = 10000
  for (const p of existing ?? []) {
    const n = parseInt(p.orNumber.replace(/\D/g, ''), 10)
    if (!Number.isNaN(n) && n > max) max = n
  }
  return `OR-${max + 1}`
}
