import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Plus } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { useSession } from '@/lib/store'
import { cn, formatDate } from '@/lib/utils'
import type { Ticket } from '@/types'

const COLUMNS: { status: Ticket['status']; label: string; tint: string }[] = [
  { status: 'new', label: 'New', tint: 'border-slate-300' },
  { status: 'assigned', label: 'Assigned', tint: 'border-amber-300' },
  { status: 'in-progress', label: 'In Progress', tint: 'border-violet-300' },
  { status: 'done', label: 'Done', tint: 'border-blue-300' },
  { status: 'verified', label: 'Verified', tint: 'border-emerald-300' },
]

const NEXT: Partial<Record<Ticket['status'], Ticket['status']>> = {
  new: 'assigned',
  assigned: 'in-progress',
  'in-progress': 'done',
  done: 'verified',
}

const CATEGORIES: Ticket['category'][] = ['electrical', 'plumbing', 'it', 'carpentry', 'janitorial', 'other']

export default function Tickets() {
  const tickets = useLiveQuery(
    () => db.tickets.orderBy('createdAt').reverse().toArray(),
    [],
  )
  const [open, setOpen] = useState(false)

  const grouped = useMemo(() => {
    const map: Record<Ticket['status'], Ticket[]> = {
      new: [], assigned: [], 'in-progress': [], done: [], verified: [],
    }
    tickets?.forEach((t) => map[t.status].push(t))
    return map
  }, [tickets])

  async function advance(t: Ticket) {
    const next = NEXT[t.status]
    if (!next) return
    await db.tickets.update(t.id, { status: next })
  }

  return (
    <>
      <PageHeader
        title="Tickets"
        subtitle="Move tickets right as work progresses. Closed tickets land in Verified."
        actions={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New ticket
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <div key={col.status} className={cn('flex flex-col rounded-xl border-2 bg-slate-50/40 p-3', col.tint)}>
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
              <span className="badge bg-white text-slate-600 ring-1 ring-slate-200">
                {grouped[col.status].length}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              {grouped[col.status].map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                  <div className="mt-1 text-xs text-slate-500 capitalize">{t.category}</div>
                  {t.description && (
                    <div className="mt-2 line-clamp-2 text-xs text-slate-600">{t.description}</div>
                  )}
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[11px] text-slate-400">{formatDate(t.createdAt)}</span>
                    {NEXT[t.status] && (
                      <button
                        onClick={() => advance(t)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        {NEXT[t.status]} <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {grouped[col.status].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {open && <NewTicketDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function NewTicketDialog({ onClose }: { onClose: () => void }) {
  const role = useSession((s) => s.role)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Ticket['category']>('other')

  async function submit() {
    if (!title.trim()) return
    await db.tickets.add({
      id: `tkt-${crypto.randomUUID().slice(0, 8)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'new',
      createdBy: role,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold">New maintenance ticket</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leaking faucet — Faculty restroom" />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input capitalize" value={category} onChange={(e) => setCategory(e.target.value as Ticket['category'])}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add detail to help triage…" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={submit} className="btn-primary">Create ticket</button>
        </div>
      </div>
    </div>
  )
}
