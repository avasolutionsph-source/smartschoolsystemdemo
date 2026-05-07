import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Plus, X } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatDate, initials } from '@/lib/utils'
import type { Lead, LeadStage } from '@/types'

const STAGES: { stage: LeadStage; label: string; tint: string }[] = [
  { stage: 'inquiry', label: 'Inquiry', tint: 'border-slate-300' },
  { stage: 'contacted', label: 'Contacted', tint: 'border-blue-300' },
  { stage: 'toured', label: 'Toured', tint: 'border-violet-300' },
  { stage: 'applied', label: 'Applied', tint: 'border-amber-300' },
  { stage: 'enrolled', label: 'Enrolled', tint: 'border-emerald-300' },
  { stage: 'lost', label: 'Lost', tint: 'border-red-300' },
]

const NEXT: Partial<Record<LeadStage, LeadStage>> = {
  inquiry: 'contacted',
  contacted: 'toured',
  toured: 'applied',
  applied: 'enrolled',
}

export default function Leads() {
  const leads = useLiveQuery(() => db.leads.toArray(), [])
  const [open, setOpen] = useState(false)
  const [drawer, setDrawer] = useState<Lead | null>(null)

  const grouped = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      inquiry: [], contacted: [], toured: [], applied: [], enrolled: [], lost: [],
    }
    leads?.forEach((l) => map[l.stage].push(l))
    return map
  }, [leads])

  async function advance(l: Lead) {
    const next = NEXT[l.stage]
    if (!next) return
    await db.leads.update(l.id, { stage: next, updatedAt: new Date().toISOString() })
  }

  async function markLost(l: Lead) {
    if (!confirm(`Mark ${l.firstName} ${l.lastName} as lost?`)) return
    await db.leads.update(l.id, { stage: 'lost', updatedAt: new Date().toISOString() })
  }

  return (
    <>
      <PageHeader
        title="Lead Pipeline"
        subtitle="Move leads right as they progress. Click any card for details."
        actions={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add lead
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((col) => (
          <div key={col.stage} className={cn('flex flex-col rounded-xl border-2 bg-slate-50/40 p-3', col.tint)}>
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
              <span className="badge bg-white text-slate-600 ring-1 ring-slate-200">
                {grouped[col.stage].length}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              {grouped[col.stage].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setDrawer(l)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-pink-100 text-xs font-semibold text-pink-700">
                      {initials(`${l.firstName} ${l.lastName}`)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {l.firstName} {l.lastName}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {l.program ?? 'Undeclared'} · {l.source}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[11px] text-slate-400">{formatDate(l.createdAt)}</span>
                    {NEXT[l.stage] && (
                      <span
                        onClick={(e) => { e.stopPropagation(); advance(l) }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        {NEXT[l.stage]} <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {grouped[col.stage].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {open && <NewLeadDialog onClose={() => setOpen(false)} />}
      {drawer && (
        <LeadDrawer
          lead={drawer}
          onClose={() => setDrawer(null)}
          onAdvance={() => { advance(drawer); setDrawer(null) }}
          onLost={() => { markLost(drawer); setDrawer(null) }}
        />
      )}
    </>
  )
}

function NewLeadDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    program: 'BSIT',
    source: 'walk-in' as Lead['source'],
    notes: '',
  })

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit() {
    if (!form.firstName || !form.lastName) return
    const now = new Date().toISOString()
    await db.leads.add({
      id: `lead-${crypto.randomUUID().slice(0, 8)}`,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      contact: form.contact,
      program: form.program,
      source: form.source,
      stage: 'inquiry',
      notes: form.notes,
      createdAt: now,
      updatedAt: now,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold">Add lead</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div><label className="label">First name</label><input className="input" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></div>
          <div><label className="label">Last name</label><input className="input" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></div>
          <div className="col-span-2"><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div><label className="label">Contact</label><input className="input" value={form.contact} onChange={(e) => update('contact', e.target.value)} /></div>
          <div><label className="label">Program</label><select className="input" value={form.program} onChange={(e) => update('program', e.target.value)}>
            {['BSIT', 'BSCS', 'BSBA', 'BSED', 'BSN'].map((p) => <option key={p}>{p}</option>)}
          </select></div>
          <div className="col-span-2"><label className="label">Source</label><select className="input capitalize" value={form.source} onChange={(e) => update('source', e.target.value as Lead['source'])}>
            {['walk-in', 'website', 'referral', 'fb', 'event'].map((s) => <option key={s}>{s}</option>)}
          </select></div>
          <div className="col-span-2"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} /></div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={submit} className="btn-primary">Add lead</button>
        </div>
      </div>
    </div>
  )
}

function LeadDrawer({
  lead, onClose, onAdvance, onLost,
}: { lead: Lead; onClose: () => void; onAdvance: () => void; onLost: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/40">
      <div className="absolute inset-0" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold">{lead.firstName} {lead.lastName}</h3>
            <div className="text-xs text-slate-500 capitalize">
              {lead.stage} · {lead.source} · since {formatDate(lead.createdAt)}
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          <Field label="Email" value={lead.email} />
          <Field label="Contact" value={lead.contact ?? '—'} />
          <Field label="Program of interest" value={lead.program ?? '—'} />
          <Field label="Notes" value={lead.notes ?? '—'} />
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-5">
          <button onClick={onLost} className="btn-outline border-red-200 text-red-600 hover:bg-red-50">
            Mark as lost
          </button>
          {NEXT[lead.stage] ? (
            <button onClick={onAdvance} className="btn-primary">
              Move to {NEXT[lead.stage]}
            </button>
          ) : (
            <span className="text-xs text-slate-500">Final stage</span>
          )}
        </div>
      </aside>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm text-slate-800">{value}</div>
    </div>
  )
}
