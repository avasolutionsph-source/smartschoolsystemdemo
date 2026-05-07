import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function HRAttendance() {
  return (
    <>
      <PageHeader
        title="Daily Time Record"
        subtitle="Employee attendance integration."
      />
      <EmptyState
        icon={ClipboardList}
        title="DTR module — Phase 6"
        description="Will integrate with biometric/QR check-in feeds. For now, payroll uses a flat monthly rate per position band."
      />
    </>
  )
}
