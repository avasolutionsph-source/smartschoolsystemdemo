import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'amber' | 'violet' | 'pink' | 'slate'
}

const accentMap = {
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  pink: 'bg-pink-50 text-pink-700',
  slate: 'bg-slate-100 text-slate-700',
}

export function StatCard({ label, value, hint, icon: Icon, accent = 'slate' }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn('grid h-10 w-10 place-items-center rounded-lg', accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}
