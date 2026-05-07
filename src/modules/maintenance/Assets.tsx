import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatDate } from '@/lib/utils'
import type { AssetStatus } from '@/types'

const STATUS_COLOR: Record<AssetStatus, string> = {
  operational: 'bg-emerald-50 text-emerald-700',
  maintenance: 'bg-amber-50 text-amber-700',
  retired: 'bg-slate-100 text-slate-600',
}

export default function Assets() {
  const assets = useLiveQuery(() => db.assets.toArray(), [])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all')

  const filtered = useMemo(() => {
    if (!assets) return []
    let list = assets
    if (statusFilter !== 'all') list = list.filter((a) => a.status === statusFilter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q),
      )
    }
    return list
  }, [assets, query, statusFilter])

  async function setStatus(id: string, status: AssetStatus) {
    await db.assets.update(id, { status })
  }

  return (
    <>
      <PageHeader title="Assets" subtitle="Registry of facilities, equipment, and vehicles." />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search asset code, name, location…"
              className="input pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'all')}
            className="input max-w-[180px] capitalize"
          >
            <option value="all">All statuses</option>
            <option value="operational">Operational</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Acquired</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{a.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                  <td className="px-4 py-3 capitalize">{a.category}</td>
                  <td className="px-4 py-3">{a.location}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => setStatus(a.id, e.target.value as AssetStatus)}
                      className={cn('text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer capitalize', STATUS_COLOR[a.status])}
                    >
                      <option value="operational">operational</option>
                      <option value="maintenance">maintenance</option>
                      <option value="retired">retired</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(a.purchasedAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-500">No assets match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
