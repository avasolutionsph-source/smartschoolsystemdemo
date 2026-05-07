import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { CreditCard } from 'lucide-react'

export default function AccountingHome() {
  return (
    <>
      <PageHeader
        title="Accounting Office"
        subtitle="Tuition assessment, payments, SOA, and clearance."
      />
      <EmptyState
        icon={CreditCard}
        title="Accounting module — Phase 3"
        description="SOA viewer, payment posting, OR generation, discounts, and financial reports."
      />
    </>
  )
}
