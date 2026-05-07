import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { db } from '@/mock/db'
import { isCashMethod } from '@/lib/financeHelpers'
import { formatPHP } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  table?: { headers: string[]; rows: string[][] }
}

const STARTER_PROMPTS = [
  'Show students with balance over 10,000',
  'How many tickets are open right now?',
  'Pending grade submissions?',
  'Lead pipeline summary',
  'Total collections this month',
]

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      role: 'assistant',
      content:
        "Hi! I'm the ABC SSS assistant. I can answer questions about your school's data — try one of the suggestions below.",
    },
  ])
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function ask(text: string) {
    if (!text.trim() || thinking) return
    const userMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'user', content: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setThinking(true)
    const reply = await answer(text.trim().toLowerCase())
    setMessages((m) => [...m, reply])
    setThinking(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Ask the AI Assistant"
        className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:brightness-110"
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/40">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-brand-600 to-violet-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">ABC SSS Assistant</div>
                  <div className="text-[11px] text-slate-500">Live answers from your data</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                  thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-100 p-3">
              <div className="flex flex-wrap gap-1.5 pb-2">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => ask(p)}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); ask(input) }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about the school…"
                  className="input"
                />
                <button type="submit" disabled={!input.trim() || thinking} className="btn-primary">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.role === 'user'
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
        mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.table && (
          <div className="mt-2 overflow-x-auto rounded-lg bg-white/60 p-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left">
                  {message.table.headers.map((h) => (
                    <th key={h} className="px-2 py-1 font-semibold uppercase tracking-wider text-[10px] text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.table.rows.map((r, i) => (
                  <tr key={i} className="border-t border-slate-200/70">
                    {r.map((c, j) => (
                      <td key={j} className="px-2 py-1 text-slate-800">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

async function answer(q: string): Promise<ChatMessage> {
  const id = `m-${Date.now() + 1}`
  // Wait a tick to simulate latency
  await new Promise((r) => setTimeout(r, 350))

  // Pattern: balance over X
  const balanceMatch = q.match(/balance.*?(\d[\d,]*)/i)
  if (balanceMatch || q.includes('balance')) {
    const threshold = balanceMatch ? Number(balanceMatch[1].replace(/,/g, '')) : 10000
    const students = await db.students.toArray()
    const payments = await db.payments.toArray()
    const paid = new Map<string, number>()
    payments.forEach((p) => paid.set(p.studentId, (paid.get(p.studentId) ?? 0) + p.amount))
    const rows = students
      .filter((s) => s.status === 'enrolled')
      .map((s) => ({ s, bal: s.assessment - (paid.get(s.id) ?? 0) }))
      .filter((r) => r.bal > threshold)
      .sort((a, b) => b.bal - a.bal)
      .slice(0, 8)
    return {
      id, role: 'assistant',
      content: `Found ${rows.length} student${rows.length === 1 ? '' : 's'} with a balance over ${formatPHP(threshold)}.`,
      table: rows.length === 0 ? undefined : {
        headers: ['Student', 'Section', 'Balance'],
        rows: rows.map((r) => [`${r.s.lastName}, ${r.s.firstName}`, r.s.section, formatPHP(r.bal)]),
      },
    }
  }

  if (q.includes('open ticket') || (q.includes('tickets') && q.includes('open'))) {
    const tickets = await db.tickets.toArray()
    const openTickets = tickets.filter((t) => t.status !== 'verified' && t.status !== 'done')
    const byCat = new Map<string, number>()
    openTickets.forEach((t) => byCat.set(t.category, (byCat.get(t.category) ?? 0) + 1))
    return {
      id, role: 'assistant',
      content: `${openTickets.length} ticket${openTickets.length === 1 ? '' : 's'} open right now.`,
      table: byCat.size === 0 ? undefined : {
        headers: ['Category', 'Count'],
        rows: Array.from(byCat, ([k, v]) => [k, String(v)]),
      },
    }
  }

  if (q.includes('pending grade') || (q.includes('grade') && q.includes('pending'))) {
    const grades = await db.grades.filter((g) => g.status === 'pending').toArray()
    const bySubject = new Map<string, number>()
    grades.forEach((g) => bySubject.set(g.subject, (bySubject.get(g.subject) ?? 0) + 1))
    return {
      id, role: 'assistant',
      content: `${grades.length} pending grade${grades.length === 1 ? '' : 's'} awaiting Registrar lock-in.`,
      table: bySubject.size === 0 ? undefined : {
        headers: ['Subject', 'Pending'],
        rows: Array.from(bySubject, ([k, v]) => [k, String(v)]),
      },
    }
  }

  if (q.includes('lead') || q.includes('pipeline')) {
    const leads = await db.leads.toArray()
    const byStage = new Map<string, number>()
    leads.forEach((l) => byStage.set(l.stage, (byStage.get(l.stage) ?? 0) + 1))
    const enrolled = byStage.get('enrolled') ?? 0
    const conv = leads.length > 0 ? Math.round((enrolled / leads.length) * 100) : 0
    return {
      id, role: 'assistant',
      content: `${leads.length} leads in the pipeline. Conversion to Enrolled: ${conv}%.`,
      table: byStage.size === 0 ? undefined : {
        headers: ['Stage', 'Count'],
        rows: Array.from(byStage, ([k, v]) => [k, String(v)]),
      },
    }
  }

  if (q.includes('collection') || q.includes('payment') || q.includes('revenue')) {
    const payments = await db.payments.toArray()
    const cash = payments.filter((p) => isCashMethod(p.method)).reduce((s, p) => s + p.amount, 0)
    const byMethod = new Map<string, number>()
    payments.filter((p) => isCashMethod(p.method)).forEach((p) => byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount))
    return {
      id, role: 'assistant',
      content: `Total cash collections to date: ${formatPHP(cash)} across ${payments.length} entries.`,
      table: byMethod.size === 0 ? undefined : {
        headers: ['Method', 'Amount'],
        rows: Array.from(byMethod, ([k, v]) => [k, formatPHP(v)]),
      },
    }
  }

  if (q.includes('headcount') || q.includes('employee')) {
    const employees = await db.employees.toArray()
    const byDept = new Map<string, number>()
    employees.forEach((e) => byDept.set(e.department, (byDept.get(e.department) ?? 0) + 1))
    return {
      id, role: 'assistant',
      content: `${employees.length} employees across ${byDept.size} departments.`,
      table: { headers: ['Department', 'Count'], rows: Array.from(byDept, ([k, v]) => [k, String(v)]) },
    }
  }

  return {
    id, role: 'assistant',
    content:
      "I can answer questions about students, payments, grades, leads, and tickets. Try one of the suggestions below — or ask things like \"who has balance over 5000\", \"how many tickets are open\", or \"lead pipeline summary\".",
  }
}
