import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { GraduationCap } from 'lucide-react'

export default function RegistrarHome() {
  return (
    <>
      <PageHeader
        title="Registrar Office"
        subtitle="Student records, enrollment, sections, documents."
      />
      <EmptyState
        icon={GraduationCap}
        title="Registrar module — Phase 2"
        description="Student 201, enrollment wizard, document request queue, and clearance monitor will be wired up next."
      />
    </>
  )
}
