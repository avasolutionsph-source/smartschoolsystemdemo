import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Wrench } from 'lucide-react'

export default function MaintenanceHome() {
  return (
    <>
      <PageHeader
        title="Maintenance / Operations"
        subtitle="Tickets, assets, recurring tasks."
      />
      <EmptyState
        icon={Wrench}
        title="Maintenance module — Phase 5"
        description="Ticket Kanban, photo attachments, asset registry, and recurring task scheduler."
      />
    </>
  )
}
