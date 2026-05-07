import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatDate } from '@/lib/utils'
import type { DocumentRequest, DocumentStatus, Student } from '@/types'

const COLUMNS: { status: DocumentStatus; label: string; tint: string }[] = [
  { status: 'pending', label: 'Pending', tint: 'border-amber-200' },
  { status: 'processing', label: 'Processing', tint: 'border-blue-200' },
  { status: 'ready', label: 'Ready for pickup', tint: 'border-emerald-200' },
  { status: 'released', label: 'Released', tint: 'border-slate-200' },
]

const NEXT: Partial<Record<DocumentStatus, DocumentStatus>> = {
  pending: 'processing',
  processing: 'ready',
  ready: 'released',
}

export default function Documents() {
  const docs = useLiveQuery(
    () => db.documentRequests.orderBy('createdAt').reverse().toArray(),
    [],
  )
  const students = useLiveQuery(() => db.students.toArray(), [])

  const byStudent = useMemo(() => {
    const m = new Map<string, Student>()
    students?.forEach((s) => m.set(s.id, s))
    return m
  }, [students])

  const grouped = useMemo(() => {
    const map: Record<DocumentStatus, DocumentRequest[]> = {
      pending: [], processing: [], ready: [], released: [],
    }
    docs?.forEach((d) => map[d.status].push(d))
    return map
  }, [docs])

  async function advance(d: DocumentRequest) {
    const next = NEXT[d.status]
    if (!next) return
    await db.documentRequests.update(d.id, { status: next, updatedAt: new Date().toISOString() })
  }

  return (
    <>
      <PageHeader
        title="Document Requests"
        subtitle="Move requests across columns to update their status."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className={cn('flex flex-col rounded-xl border-2 bg-slate-50/40 p-3', col.tint)}>
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
              <span className="badge bg-white text-slate-600 ring-1 ring-slate-200">
                {grouped[col.status].length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {grouped[col.status].map((d) => {
                const s = byStudent.get(d.studentId)
                return (
                  <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{d.documentType}</div>
                        <div className="text-xs text-slate-500">
                          {s ? `${s.lastName}, ${s.firstName}` : 'Unknown student'}
                          {s && <span className="text-slate-400"> · {s.studentNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">{d.purpose}</div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[11px] text-slate-400">{formatDate(d.createdAt)}</span>
                      {NEXT[d.status] && (
                        <button onClick={() => advance(d)} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                          Move to {NEXT[d.status]} <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {grouped[col.status].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Tip: when a student files a request from the Student Portal, it lands in <strong>Pending</strong>.
        Click <em>Move to ready</em> to flip the student's tracker to "Ready for pickup".
      </p>
    </>
  )
}
