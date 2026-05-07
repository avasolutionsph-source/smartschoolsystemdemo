import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Save } from 'lucide-react'
import { db } from '@/mock/db'
import { PageHeader } from '@/components/PageHeader'
import { currentStudentId } from '@/lib/studentHelpers'
import { initials } from '@/lib/utils'

export default function StudentProfile() {
  const sid = currentStudentId()
  const student = useLiveQuery(() => db.students.get(sid), [sid])
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (student) {
      setContact(student.contact ?? '')
      setAddress(student.address ?? '')
    }
  }, [student])

  if (!student) {
    return <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
  }

  async function save() {
    await db.students.update(sid, { contact, address })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Bio data is read-only — coordinate with the Registrar to correct it. You may update contact and address."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
            {initials(`${student.firstName} ${student.lastName}`)}
          </div>
          <h3 className="mt-3 text-lg font-semibold">
            {student.firstName} {student.lastName}
          </h3>
          <div className="mt-1 text-xs text-slate-500">{student.studentNumber}</div>
          <div className="mt-3 inline-flex flex-col gap-1 text-xs">
            <span className="badge bg-blue-50 text-blue-700">{student.program}</span>
            <span className="badge bg-violet-50 text-violet-700">{student.section}</span>
            <span className="badge bg-emerald-50 text-emerald-700 capitalize">{student.status.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Bio (Registrar-managed)</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ReadOnly label="First name" value={student.firstName} />
            <ReadOnly label="Middle name" value={student.middleName ?? '—'} />
            <ReadOnly label="Last name" value={student.lastName} />
            <ReadOnly label="Email" value={student.email} />
            <ReadOnly label="Year level" value={`Year ${student.yearLevel}`} />
            <ReadOnly label="Section" value={student.section} />
            <ReadOnly label="Guardian" value={student.guardianName ?? '—'} />
            <ReadOnly label="Guardian contact" value={student.guardianContact ?? '—'} />
          </div>

          <hr className="border-slate-100" />

          <h3 className="text-sm font-semibold text-slate-800">Contact info (you can edit)</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Contact number</label>
              <input className="input" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-xs font-medium text-emerald-600">Saved ✓</span>}
            <button onClick={save} className="btn-primary">
              <Save className="h-4 w-4" /> Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {value}
      </div>
    </div>
  )
}
