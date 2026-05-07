import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { cn, formatPHP } from '@/lib/utils'
import type { Student } from '@/types'

const PROGRAMS = ['BSIT', 'BSCS', 'BSBA', 'BSED', 'BSN']
const PROGRAM_TUITION: Record<string, number> = {
  BSIT: 28000, BSCS: 30000, BSBA: 26000, BSED: 24000, BSN: 32000,
}
const SECTIONS = ['A', 'B', 'C']

const STEPS = ['Bio Information', 'Program & Section', 'Review & Submit']

interface FormData {
  firstName: string
  middleName: string
  lastName: string
  email: string
  contact: string
  address: string
  guardianName: string
  guardianContact: string
  program: string
  yearLevel: number
  sectionLetter: string
}

const EMPTY: FormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  contact: '',
  address: '',
  guardianName: '',
  guardianContact: '',
  program: 'BSIT',
  yearLevel: 1,
  sectionLetter: 'A',
}

export default function Enrollment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<Student | null>(null)

  const assessment = PROGRAM_TUITION[data.program] ?? 25000

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function canProceed() {
    if (step === 0) return data.firstName && data.lastName && data.email
    if (step === 1) return data.program && data.yearLevel && data.sectionLetter
    return true
  }

  async function submit() {
    setSubmitting(true)
    const count = await db.students.count()
    const student: Student = {
      id: `std-${(count + 1).toString().padStart(4, '0')}`,
      studentNumber: `2025-${(2000 + count).toString()}`,
      firstName: data.firstName.trim(),
      middleName: data.middleName.trim() || undefined,
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      contact: data.contact.trim() || undefined,
      address: data.address.trim() || undefined,
      guardianName: data.guardianName.trim() || undefined,
      guardianContact: data.guardianContact.trim() || undefined,
      program: data.program,
      yearLevel: data.yearLevel,
      section: `${data.program}-${data.yearLevel}${data.sectionLetter}`,
      status: 'enrolled',
      enrolledAt: new Date().toISOString(),
      assessment,
    }
    await db.students.add(student)
    setSubmitting(false)
    setDone(student)
  }

  if (done) {
    return (
      <>
        <PageHeader title="Enrollment Complete" />
        <div className="card p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Welcome, {done.firstName}!</h3>
          <p className="mt-1 text-sm text-slate-600">
            Student <strong>{done.studentNumber}</strong> has been enrolled in{' '}
            <strong>{done.section}</strong>. Assessment <strong>{formatPHP(done.assessment)}</strong>{' '}
            generated.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => { setDone(null); setData(EMPTY); setStep(0); }} className="btn-outline">
              Enroll another
            </button>
            <button onClick={() => navigate('/registrar/students')} className="btn-primary">
              View students
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="New Enrollment"
        subtitle="3-step wizard. Once submitted, the student is available to all offices."
      />

      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                i < step ? 'bg-emerald-500 text-white'
                  : i === step ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 text-slate-500',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div className={cn('ml-2 text-xs font-medium', i === step ? 'text-slate-800' : 'text-slate-500')}>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={cn('mx-3 h-px flex-1', i < step ? 'bg-emerald-300' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">First name *</label>
              <input className="input" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} />
            </div>
            <div>
              <label className="label">Middle name</label>
              <input className="input" value={data.middleName} onChange={(e) => update('middleName', e.target.value)} />
            </div>
            <div>
              <label className="label">Last name *</label>
              <input className="input" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Contact</label>
              <input className="input" value={data.contact} onChange={(e) => update('contact', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <input className="input" value={data.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <div>
              <label className="label">Guardian name</label>
              <input className="input" value={data.guardianName} onChange={(e) => update('guardianName', e.target.value)} />
            </div>
            <div>
              <label className="label">Guardian contact</label>
              <input className="input" value={data.guardianContact} onChange={(e) => update('guardianContact', e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="label">Program *</label>
              <select className="input" value={data.program} onChange={(e) => update('program', e.target.value)}>
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year level *</label>
              <select
                className="input"
                value={data.yearLevel}
                onChange={(e) => update('yearLevel', Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Section *</label>
              <select className="input" value={data.sectionLetter} onChange={(e) => update('sectionLetter', e.target.value)}>
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wider text-slate-500">Auto-generated</div>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <div className="text-sm">Section code: <strong>{data.program}-{data.yearLevel}{data.sectionLetter}</strong></div>
                  <div className="text-sm">Assessment: <strong className="text-emerald-700">{formatPHP(assessment)}</strong></div>
                </div>
                <GraduationCap className="h-8 w-8 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Review label="Name" value={`${data.firstName} ${data.middleName} ${data.lastName}`.trim()} />
              <Review label="Email" value={data.email} />
              <Review label="Contact" value={data.contact || '—'} />
              <Review label="Address" value={data.address || '—'} />
              <Review label="Guardian" value={data.guardianName || '—'} />
              <Review label="Guardian contact" value={data.guardianContact || '—'} />
              <Review label="Program" value={`${data.program} (Year ${data.yearLevel})`} />
              <Review label="Section" value={`${data.program}-${data.yearLevel}${data.sectionLetter}`} />
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              On submit, this student will be created with assessment <strong>{formatPHP(assessment)}</strong>.
              Accounting and the Student Portal will pick it up automatically.
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-outline"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? 'Enrolling…' : 'Submit enrollment'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}
