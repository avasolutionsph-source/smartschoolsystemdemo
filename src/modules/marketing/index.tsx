import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Megaphone } from 'lucide-react'

export default function MarketingHome() {
  return (
    <>
      <PageHeader
        title="Marketing / Admissions"
        subtitle="Inquiry intake, lead pipeline, promotions."
      />
      <EmptyState
        icon={Megaphone}
        title="Marketing module — Phase 5"
        description="Public inquiry form, lead Kanban, applicant profile, communication log, and conversion analytics."
      />
    </>
  )
}
