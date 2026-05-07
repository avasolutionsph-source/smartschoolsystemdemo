import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { BarChart3 } from 'lucide-react'

export default function Reports() {
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Cross-office analytical reports. Coming in Phase 6."
      />
      <EmptyState
        icon={BarChart3}
        title="Reports module — Phase 6"
        description="Enrollment trends, collection efficiency, attendance, faculty load, and ticket SLA reports will live here."
      />
    </>
  )
}
