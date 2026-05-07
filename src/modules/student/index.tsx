import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { GraduationCap } from 'lucide-react'

export default function StudentHome() {
  return (
    <>
      <PageHeader
        title="Student Portal"
        subtitle="Schedule, grades, SOA, document requests, clearance."
      />
      <EmptyState
        icon={GraduationCap}
        title="Student module — Phase 2"
        description="Personal dashboard, schedule, grades, SOA, document tracker, and clearance status."
      />
    </>
  )
}
