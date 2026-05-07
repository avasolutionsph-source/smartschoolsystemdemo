import { Link } from 'react-router-dom'
import {
  ArrowRight, Award, BookOpen, Briefcase, Building2, GraduationCap,
  HeartPulse, LineChart, MessageSquare, Phone, Sparkles, Users,
} from 'lucide-react'

const PROGRAMS = [
  { code: 'BSIT', name: 'BS Information Technology', icon: BookOpen, blurb: 'Software development, networking, and database systems.' },
  { code: 'BSCS', name: 'BS Computer Science', icon: LineChart, blurb: 'Algorithms, AI fundamentals, and theoretical foundations.' },
  { code: 'BSBA', name: 'BS Business Administration', icon: Briefcase, blurb: 'Management, marketing, finance, and entrepreneurship.' },
  { code: 'BSED', name: 'BS Education', icon: GraduationCap, blurb: 'K-12 teaching, curriculum design, and educational psychology.' },
  { code: 'BSN', name: 'BS Nursing', icon: HeartPulse, blurb: 'Clinical practice, anatomy, and patient care.' },
]

const HIGHLIGHTS = [
  { icon: Award, title: 'Industry-aligned', body: 'Curricula updated with input from local employers and licensure boards.' },
  { icon: Users, title: 'Small classes', body: 'Average 1:25 faculty-to-student ratio across all programs.' },
  { icon: Building2, title: 'Modern facilities', body: 'Computer labs, simulation rooms, library, and student lounges.' },
  { icon: Sparkles, title: 'Smart campus', body: 'One unified portal for grades, payments, and clearances.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">A</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">ABC Smart School System</div>
              <div className="text-[11px] text-slate-500">Naga · Philippines</div>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <a href="#programs" className="hidden rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 sm:inline-block">Programs</a>
            <a href="#why" className="hidden rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 sm:inline-block">Why ABC</a>
            <a href="#contact" className="hidden rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 sm:inline-block">Contact</a>
            <Link to="/inquire" className="btn-outline">Inquire</Link>
            <Link to="/login" className="btn-primary">Sign in</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-pink-50" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AY 2026–2027 Enrollment is open
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Learning, made <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">simple</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              ABC School unifies your enrollment, grades, payments, and clearances in one secure platform —
              for students, parents, faculty, and every office in between.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/inquire" className="btn-primary">
                Inquire now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-outline">
                Portal sign in
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat value="60+" label="Active students" />
              <Stat value="25" label="Faculty & staff" />
              <Stat value="5" label="Programs offered" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <div className="ml-3 flex-1 rounded-md bg-white px-2 py-0.5 text-[10px] text-slate-500">
                    portal.abcschool.edu / dashboard
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Tile icon={Users} label="Students" value="60" tint="bg-blue-50 text-blue-700" />
                  <Tile icon={GraduationCap} label="Avg Grade" value="86" tint="bg-violet-50 text-violet-700" />
                  <Tile icon={LineChart} label="Collections" value="₱1.2M" tint="bg-emerald-50 text-emerald-700" />
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Today's classes</div>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    <li className="flex items-center justify-between">
                      <span>Programming 1 · BSIT-1A</span>
                      <span className="font-mono text-slate-500">08:00</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Web Development · BSIT-3A</span>
                      <span className="font-mono text-slate-500">13:00</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Algorithms · BSCS-2A</span>
                      <span className="font-mono text-slate-500">14:30</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-slate-200 bg-white p-3 shadow-lg max-w-[220px]">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Payment posted</div>
                  <div className="text-[10px] text-slate-500">Balance updated in real-time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Why families choose ABC</h2>
            <p className="mt-3 text-slate-600">
              Quality education backed by a campus that works as one — every office connected, every record current.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <h.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{h.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Programs offered</h2>
              <p className="mt-2 text-slate-600">Five undergraduate programs across IT, business, education, and health.</p>
            </div>
            <Link to="/inquire" className="hidden btn-primary sm:inline-flex">
              Apply <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((p) => (
              <div key={p.code} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-700">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <span className="badge bg-slate-100 text-slate-700">{p.code}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-10 text-white shadow-2xl sm:p-14">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold">Ready to enroll?</h2>
                <p className="mt-2 max-w-xl text-white/85">
                  Submit a quick inquiry and our Admissions team will reach out within one business day.
                  Already have an account? Jump straight to your portal.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                    <Phone className="h-3.5 w-3.5" /> (054) 555-0123
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                    <MessageSquare className="h-3.5 w-3.5" /> admissions@abc.edu
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Link to="/inquire" className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-slate-50">
                  Inquire now
                </Link>
                <Link to="/login" className="rounded-lg border border-white/30 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10">
                  Portal sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-slate-500 sm:flex-row">
          <div>© 2026 ABC Smart School System. Demo build — no real data.</div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-900">Sign in</Link>
            <Link to="/inquire" className="hover:text-slate-900">Inquire</Link>
            <span className="text-slate-300">·</span>
            <span>Built with React + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function Tile({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className={`grid h-7 w-7 place-items-center rounded-md ${tint}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}
