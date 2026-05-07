import { Link } from 'react-router-dom'
import { ExternalLink, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

export default function Promos() {
  return (
    <>
      <PageHeader
        title="Promos & Public Inquiry"
        subtitle="Embed the inquiry form on your website. Submissions land in the Lead Pipeline as 'Inquiry'."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-500" />
            <h3 className="text-sm font-semibold text-slate-800">Public Inquiry Form</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            A no-login form prospects can fill out from your website. Each submission creates a new lead.
          </p>
          <Link
            to="/inquire"
            target="_blank"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open public form
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800">Active Promos</h3>
          <p className="mt-2 text-sm text-slate-600">
            (Demo placeholder) Coming in Phase 6: scheduled email/SMS blasts, scholarship promos, and event RSVPs.
          </p>
        </div>
      </div>
    </>
  )
}
