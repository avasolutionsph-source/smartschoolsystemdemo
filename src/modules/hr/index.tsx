import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Briefcase } from 'lucide-react'

export default function HRHome() {
  return (
    <>
      <PageHeader
        title="HR / Payroll"
        subtitle="Employees, attendance, payroll, payslips."
      />
      <EmptyState
        icon={Briefcase}
        title="HR module — Phase 5"
        description="Employee 201, DTR, payroll wizard with computation engine, payslip preview, and remittance reports."
      />
    </>
  )
}
