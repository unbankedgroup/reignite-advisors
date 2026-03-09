
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import EditLeadProfile from '@/components/EditLeadProfile'
import CollapsibleResponses from '@/components/CollapsibleResponses'

const MAX_SCORES: Record<string, number> = {
  Signal: 12,
  Structure: 12,
  'Commercial Gravity': 12,
  'Scale Readiness': 23,
}
const TOTAL_MAX = 59

function getTier(score: number): { label: string; bg: string; color: string } {
  const pct = score / TOTAL_MAX
  if (pct > 0.63) return { label: 'Top',     bg: '#dcfce7', color: '#166534' }
  if (pct > 0.25) return { label: 'Average', bg: '#fef9c3', color: '#854d0e' }
  return              { label: 'Poor',    bg: '#fee2e2', color: '#991b1b' }
}

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
  const totalScore = lead.score ?? Object.values(catScores).reduce((a, b) => a + b, 0)
  const hasAssessment = responses.filter(r => r.questionId !== 15).length > 0
  const tier = hasAssessment ? getTier(totalScore) : null

  const displayName = (lead.first_name && lead.last_name)
    ? `${lead.first_name} ${lead.last_name}`
    : (lead.first_name || lead.last_name || lead.name)

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-xs mb-3 inline-block font-medium" style={{ color: 'var(--muted)' }}>
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>{displayName}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Submitted {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {tier && (
            <div className="text-right mt-6 flex flex-col items-end gap-2">
              <span
                className="text-xs px-3 py-1 rounded-full font-bold"
                style={{ background: tier.bg, color: tier.color }}
              >
                {tier.label}
              </span>
              <div>
                <span className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{totalScore}</span>
                <span className="text-base font-normal" style={{ color: 'var(--muted)' }}>/{TOTAL_MAX}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Total Score</div>
            </div>
          )}
        </div>

        {/* Editable profile */}
        <EditLeadProfile lead={lead} />

        {hasAssessment ? (
          <>
            {/* Category score bars */}
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
              Experience-to-Asset Scorecard
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
                      <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Collapsible responses */}
            <CollapsibleResponses responses={responses} />
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
