import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, RefreshCw, Search } from 'lucide-react'
import { useSession } from '@/lib/store'
import { ROLE_ACCENT, ROLE_HOME, ROLE_LABEL, ROLES } from '@/lib/roles'
import { reseed } from '@/mock/seed'
import { cn, initials } from '@/lib/utils'
import type { Role } from '@/types'

export function TopBar() {
  const { role, displayName, setRole, logout } = useSession()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const accent = ROLE_ACCENT[role]

  function switchTo(r: Role) {
    setRole(r)
    setOpen(false)
    navigate(ROLE_HOME[r])
  }

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  async function handleReset() {
    if (!confirm('Reset all demo data? This will reseed the mock database.')) return
    await reseed()
    location.reload()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          A
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">ABC Smart School System</div>
          <div className="text-xs text-slate-500">Demo · v0.1</div>
        </div>
      </div>

      <div className="hidden flex-1 max-w-md mx-8 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, employees, tickets…"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          title="Reset demo data"
          className="btn-ghost"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Reset</span>
        </button>
        <button className="btn-ghost" title="Notifications">
          <Bell className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {initials(displayName)}
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-medium">{displayName}</div>
              <div className={cn('text-[10px] font-medium uppercase tracking-wide', 'text-slate-500')}>
                <span className={cn('inline-block h-1.5 w-1.5 rounded-full mr-1', accent.dot)} />
                {ROLE_LABEL[role]}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch role (demo)
                </div>
                {ROLES.map((r) => {
                  const a = ROLE_ACCENT[r]
                  return (
                    <button
                      key={r}
                      onClick={() => switchTo(r)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50',
                        r === role && 'bg-slate-50 font-medium',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', a.dot)} />
                        {ROLE_LABEL[r]}
                      </span>
                      {r === role && <span className="text-[10px] text-brand-600">current</span>}
                    </button>
                  )
                })}
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
