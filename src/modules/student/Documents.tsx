import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { currentStudentId } from '@/lib/studentHelpers'
import { cn, formatDate } from '@/lib/utils'
import type { DocumentRequest, DocumentStatus, DocumentType } from '@/types'

const TYPES: DocumentType[] = ['TOR', 'COE', 'Form 137', 'Good Moral']

const STATUS_COLOR: Record<DocumentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  ready: 'bg-emerald-50 text-emerald-700',
  released: 'bg-slate-100 text-slate-600',
}

const PROGRESS: Record<DocumentStatus, number> = {
  pending: 25,
  processing: 50,
  ready: 80,
  released: 100,
}

export default function StudentDocuments() {
  const sid = currentStudentId()
  const docs = useLiveQuery(
    () =>
      db.documentRequests
        .where('studentId').equals(sid)
        .reverse().sortBy('createdAt'),
    [sid],
  )

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<DocumentType>('TOR')
  const [purpose, setPurpose] = useState('')

  async function submit() {
    if (!purpose.trim()) return
    const now = new Date().toISOString()
    const doc: DocumentRequest = {
      id: `doc-${crypto.randomUUID().slice(0, 8)}`,
      studentId: sid,
      documentType: type,
      purpose: purpose.trim(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }
    await db.documentRequests.add(doc)
    setOpen(false)
    setType('TOR')
    setPurpose('')
  }

  return (
    <>
      <PageHeader
        title="Document Requests"
        subtitle="Track requests filed with the Registrar Office."
        actions={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New request
          </button>
        }
      />

      <div className="space-y-3">
        {docs?.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">{d.documentType}</h4>
                  <span className={cn('badge capitalize', STATUS_COLOR[d.status])}>
                    {d.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{d.purpose}</p>
                <div className="mt-1 text-[11px] text-slate-400">
                  Filed {formatDate(d.createdAt)} · Updated {formatDate(d.updatedAt)}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-full transition-all',
                    d.status === 'released' ? 'bg-slate-400' : 'bg-brand-500',
                  )}
                  style={{ width: `${PROGRESS[d.status]}%` }}
                />
              </div>
              <div className="mt-1 grid grid-cols-4 text-[10px] uppercase tracking-wider text-slate-400">
                <span>Pending</span>
                <span className="text-center">Processing</span>
                <span className="text-center">Ready</span>
                <span className="text-right">Released</span>
              </div>
            </div>
          </div>
        ))}
        {docs && docs.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-500">
            You haven't filed any document requests yet.
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold">New document request</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              The Registrar will be notified immediately.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Document type</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Purpose</label>
                <textarea
                  className="input"
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. For board exam application"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
                <button onClick={submit} className="btn-primary">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
