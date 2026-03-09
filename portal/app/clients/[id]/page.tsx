
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

const QUESTION_TEXTS: Record<number, string> = {
  1:  'Can you describe your offer in one clear sentence?',
  2:  'How clearly can someone understand what makes your work different within 30 seconds?',
  3:  'Do you have an offer that generates value without your constant involvement?',
  4:  'Have you narrowed your audience to a specific group?',
  5:  'If you stopped working for 30 days, what would happen?',
  6:  'Do you have a defined progression from entry-level to higher-value engagements?',
  7:  'Is your expertise delivered through a defined framework?',
  8:  'Is your offer tied to a problem with measurable financial or strategic consequences?',
  9:  'Have you validated demand with paying clients?',
  10: 'How is your work currently priced?',
  11: 'Which best describes your current professional situation?',
  12: 'Which outcome best describes your current focus?',
  13: 'What is quietly holding you back from moving forward?',
  14: 'What level of support are you prepared to invest in?',
  15: 'Is there anything else that would help me understand your situation?',
}

const MAX_SCORES: Record<string, number> = {
  Signal: 12,
  Structure: 12,
  'Commercial Gravity': 12,
  'Scale Readiness': 23,
}
const TOTAL_MAX = 59

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const responses: { questionId: number; category: string; text: string; value: number }[] =
    Array.isArray(lead.responses) ? lead.responses : []

  const catScores: Record<string, number> = { Signal: 0, Structure: 0, 'Commercial Gravity': 0, 'Scale Readiness': 0 }
  for (const r of responses) {
    if (catScores[r.category] !== undefined) catScores[r.category] += r.value
  }
  const totalScore = Object.values(catScores).reduce((a, b) => a + b, 0)
  const freeform = responses.find(r => r.questionId === 15)?.text
  const mainResponses = responses.filter(r => r.questionId !== 15)
  const hasAssessment = mainResponses.length > 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-xs mb-3 inline-block font-medium" style={{ color: 'var(--muted)' }}>
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>{lead.name}</h1>
          </div>
          {hasAssessment && lead.score != null && (
            <div className="text-right mt-6">
              <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                {lead.score}
                <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>/{TOTAL_MAX}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Total Score</div>
            </div>
          )}
        </div>

        {/* Profile info */}
        <div className="p-6 rounded-xl mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 gap-6">
            <InfoRow label="Email" value={lead.email} />
            <InfoRow
              label="Submitted"
              value={new Date(lead.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
          </div>
        </div>

        {hasAssessment ? (
          <>
            {/* Score header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Experience-to-Asset Scorecard
              </h2>
            </div>

            {/* Category score bars */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {Object.entries(catScores).map(([cat, score]) => {
                const max = MAX_SCORES[cat]
                const pct = score / max
                return (
                  <div key={cat} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{cat}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{score}/{max}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(27,42,74,0.08)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct * 100}%`, background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Q&A responses */}
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
              Responses
            </h3>
            <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
              {mainResponses.map((r, i) => (
                <div
                  key={r.questionId}
                  className="px-6 py-4"
                  style={{
                    background: i % 2 === 0 ? '#fff' : 'var(--surface)',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div className="text-xs mb-1 font-medium" style={{ color: 'var(--muted)' }}>
                    Q{r.questionId} · {r.category}
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--navy)' }}>
                    {QUESTION_TEXTS[r.questionId] ?? ''}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>{r.text || '—'}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold shrink-0"
                      style={{ background: '#fff7ed', color: '#9a3412' }}
                    >
                      {r.value} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {freeform && (
              <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                  Additional Context
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{freeform}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No assessment responses recorded.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="text-sm" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
  )
}
