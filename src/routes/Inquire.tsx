import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { db } from '@/mock/db'
import type { Lead } from '@/types'

export default function Inquire() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    program: 'BSIT',
    source: 'website' as Lead['source'],
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email) return
    setSubmitting(true)
    const now = new Date().toISOString()
    await db.leads.add({
      id: `lead-${crypto.randomUUID().slice(0, 8)}`,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      contact: form.contact,
      program: form.program,
      source: form.source,
      stage: 'inquiry',
      notes: form.notes,
      createdAt: now,
      updatedAt: now,
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-gradient-to-br from-pink-700 via-pink-600 to-rose-500 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-base font-bold backdrop-blur">A</div>
          <div>
            <div className="text-sm font-semibold">ABC Smart School System</div>
            <div className="text-xs text-white/70">Apply · Inquire · Visit</div>
          </div>
        </div>

        <div className="max-w-md">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Public inquiry
          </div>
          <h1 className="text-4xl font-semibold leading-tight">
            Tell us about you. <br />
            We'll take it from there.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/85">
            Your inquiry lands instantly in the Marketing & Admissions Office. Expect a reply within one business day.
          </p>
        </div>

        <div className="text-xs text-white/70">No login required · Demo only</div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-center text-xl font-semibold">Thanks, {form.firstName}!</h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                We've received your inquiry. The Admissions team will reach out at <strong>{form.email}</strong> shortly.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ ...form, firstName: '', lastName: '', email: '', contact: '', notes: '' }) }}
                className="mt-6 btn-outline w-full"
              >
                Submit another
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Inquiry form</h2>
              <p className="mt-1 text-sm text-slate-500">Tell us a bit about yourself.</p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">First name *</label>
                    <input className="input" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Last name *</label>
                    <input className="input" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Contact number</label>
                  <input className="input" value={form.contact} onChange={(e) => update('contact', e.target.value)} />
                </div>
                <div>
                  <label className="label">Program of interest</label>
                  <select className="input" value={form.program} onChange={(e) => update('program', e.target.value)}>
                    {['BSIT', 'BSCS', 'BSBA', 'BSED', 'BSN'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tell us anything else (optional)</label>
                  <textarea
                    className="input" rows={3}
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    placeholder="e.g. I'd like a campus tour next week"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Sending…' : 'Submit inquiry'}
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Demo only — submissions are stored in your browser's local database.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
