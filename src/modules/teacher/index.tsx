import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Users2 } from 'lucide-react'

export default function TeacherHome() {
  return (
    <>
      <PageHeader
        title="Teacher Portal"
        subtitle="Class lists, attendance, grade encoding."
      />
      <EmptyState
        icon={Users2}
        title="Teacher module — Phase 4"
        description="My classes, attendance encoding, Excel-like grade sheet, and class announcements."
      />
    </>
  )
}
