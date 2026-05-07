import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { ROLE_LABEL, ROLES } from '@/lib/roles'
import { formatDateTime, cn } from '@/lib/utils'
import { useSession } from '@/lib/store'
import type { AnnouncementAudience } from '@/types'

const AUDIENCES: { value: AnnouncementAudience; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  ...ROLES.map((r) => ({ value: r as AnnouncementAudience, label: ROLE_LABEL[r] })),
]

export default function Announcements() {
  const role = useSession((s) => s.role)
  const list = useLiveQuery(
    () => db.announcements.orderBy('createdAt').reverse().toArray(),
    [],
  )

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [picked, setPicked] = useState<AnnouncementAudience[]>(['all'])

  function toggleAudience(v: AnnouncementAudience) {
    setPicked((p) => {
      if (v === 'all') return ['all']
      const next = p.filter((x) => x !== 'all' && x !== v)
      return p.includes(v) ? next : [...next, v]
    })
  }

  async function publish() {
    if (!title || !body || picked.length === 0) return
    await db.announcements.add({
      id: `ann-${crypto.randomUUID().slice(0, 8)}`,
      title,
      body,
      audiences: picked,
      createdBy: role,
      createdAt: new Date().toISOString(),
    })
    setTitle('')
    setBody('')
    setPicked(['all'])
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return
    await db.announcements.delete(id)
  }

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Target by role. Each portal will see only what's addressed to it."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Compose</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Announcement headline"
              />
            </div>
            <div>
              <label className="label">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="input"
                placeholder="Write your message…"
              />
            </div>
            <div>
              <label className="label">Audience</label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((a) => {
                  const active = picked.includes(a.value)
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => toggleAudience(a.value)}
                      className={cn(
                        'badge cursor-pointer border',
                        active
                          ? 'border-brand-300 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      {a.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={publish} className="btn-primary">
                <Plus className="h-4 w-4" /> Publish
              </button>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Targeting tip</h3>
          <p className="text-sm text-slate-600">
            Pick <strong>Everyone</strong> for school-wide news; combine specific roles for
            tighter reach (e.g., Teacher + Admin for a faculty memo). Students will only see
            what is addressed to them.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Published</h3>
        <div className="space-y-3">
          {list?.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-800">{a.title}</h4>
                    {a.audiences.map((aud) => (
                      <span key={aud} className="badge bg-slate-100 text-slate-600">
                        {aud === 'all' ? 'Everyone' : ROLE_LABEL[aud]}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                  <div className="mt-2 text-[11px] text-slate-400">
                    {formatDateTime(a.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {list && list.length === 0 && (
            <div className="card p-8 text-center text-sm text-slate-500">
              No announcements yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
