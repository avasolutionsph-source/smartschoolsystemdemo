import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import { useSession } from '@/lib/store'
import { ROLE_ACCENT, ROLE_HOME, ROLE_LABEL } from '@/lib/roles'
import { DEMO_ACCOUNTS, findDemoAccount, type DemoAccount } from '@/lib/demoCreds'
import { cn } from '@/lib/utils'

export default function Login() {
  const navigate = useNavigate()
  const { login, loggedIn, role } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loggedIn) navigate(ROLE_HOME[role], { replace: true })
  }, [loggedIn, role, navigate])

  function fillFor(acc: DemoAccount) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError(null)
  }

  function quickLogin(acc: DemoAccount) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError(null)
    login(acc.role, acc.email, acc.name)
    navigate(ROLE_HOME[acc.role], { replace: true })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setTimeout(() => {
      const acc = findDemoAccount(email, password)
      if (!acc) {
        setError('Invalid email or password. Tip: tap any role chip below to auto-fill.')
        setLoading(false)
        return
      }
      login(acc.role, acc.email, acc.name)
      navigate(ROLE_HOME[acc.role], { replace: true })
    }, 250)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
      <div className="hidden lg:col-span-3 lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-base font-bold backdrop-blur">
            A
          </div>
          <div>
            <div className="text-sm font-semibold">ABC Smart School System</div>
            <div className="text-xs text-white/70">One platform · every office</div>
          </div>
        </div>

        <div className="max-w-lg">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Frontend demo · v0.1
          </div>
          <h1 className="text-4xl font-semibold leading-tight">
            One database.<br />
            Many doors.<br />
            <span className="text-white/70">Right access for each role.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/80">
            Enroll a student, post a payment, submit a grade — and watch every office
            update instantly. This demo runs entirely in your browser.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 text-xs text-white/80">
          {DEMO_ACCOUNTS.slice(0, 8).map((a) => (
            <div key={a.role} className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
              <div className="text-[10px] uppercase tracking-wider text-white/60">Office</div>
              <div className="mt-0.5 font-medium">{ROLE_LABEL[a.role]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1 flex items-center justify-center bg-slate-50 p-6 lg:col-span-2">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              A
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">ABC Smart School System</div>
              <div className="text-xs text-slate-500">Frontend demo · v0.1</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use any demo account below — credentials auto-fill on click.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                autoComplete="username"
                placeholder="role@abc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            Demo accounts
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => {
              const accent = ROLE_ACCENT[a.role]
              return (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => fillFor(a)}
                  onDoubleClick={() => quickLogin(a)}
                  title="Click to autofill · double-click to sign in"
                  className="group flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', accent.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-800">
                      {ROLE_LABEL[a.role]}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">{a.email}</div>
                    <div className="truncate text-[10px] text-slate-400">pwd: {a.password}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      quickLogin(a)
                    }}
                    className="self-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700 opacity-0 transition group-hover:opacity-100 hover:bg-brand-600 hover:text-white"
                  >
                    Sign in
                  </button>
                </button>
              )
            })}
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Demo only — no real authentication. Data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  )
}
