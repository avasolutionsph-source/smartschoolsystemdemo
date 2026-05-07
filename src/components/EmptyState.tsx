import { Construction } from 'lucide-react'

interface Props {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function EmptyState({ title, description, icon: Icon = Construction }: Props) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      )}
    </div>
  )
}
