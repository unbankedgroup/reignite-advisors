
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

const MAX_SCORES: Record<string, number> = {
  Signal: 12,
  Structure: 12,
  'Commercial Gravity': 12,
  'Scale Readiness': 23,
}
const TOTAL_MAX = 59

function getTier(score: number): { label: string; bg: string; color: string; description: string } {
  const pct = score / TOTAL_MAX
  if (pct > 0.63) return {
    label: 'Strong Foundation',
    bg: '#dcfce7',
    color: '#166534',
    description: 'Your experience is well-structured and positioned for leverage. You\'re ready to build at a higher level.',
  }
  if (pct > 0.25) return {
    label: 'Building Momentum',
    bg: '#fef9c3',
    color: '#854d0e',
    description: 'You have real potential and some structure in place. A few focused moves could significantly accelerate your trajectory.',
  }
  return {
    label: 'Early Stage',
    bg: '#fee2e2',
    color: '#991b1b',
    description: 'There\'s clear opportunity ahead. The right structure and positioning will unlock the value in your experience.',
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status, responses, completed_at')
    .eq('token', token)
    .single()

  if (!assessment || assessment.status !== 'completed') notFound()

  const responses: { questionId: number; category: string; text: string; value: number }[] =
    Array.isArray(assessment.responses) ? assessment.responses : []

  const catScores: Record<string, number> = { Signal: 0, Structure: 0, 'Commercial Gravity': 0, 'Scale Readiness': 0 }
  for (const r of responses) {
    if (catScores[r.category] !== undefined) catScores[r.category] += r.value
  }
  const totalScore = Object.values(catScores).reduce((a, b) => a + b, 0)
  const tier = getTier(totalScore)

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--accent)' }}>
          Reignite Advisors
        </span>
      </div>

      <main className="max-w-lg mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>
          Your Scorecard
        </div>
        <h1 className="text-2xl font-light mb-2 leading-snug" style={{ color: 'var(--foreground)' }}>
          Experience-to-Asset Assessment
        </h1>
        {assessment.completed_at && (
          <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>
            Completed {new Date(assessment.completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {/* Overall score */}
        <div className="p-6 rounded-xl mb-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-5xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{totalScore}</div>
          <div className="text-sm mb-4" style={{ color: 'var(--muted)' }}>out of {TOTAL_MAX}</div>
          <span
            className="inline-block text-xs px-3 py-1 rounded-full font-bold mb-4"
            style={{ background: tier.bg, color: tier.color }}
          >
            {tier.label}
          </span>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            {tier.description}
          </p>
        </div>

        {/* Category scores */}
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
          Category Breakdown
        </h2>
        <div className="space-y-3 mb-10">
          {Object.entries(catScores).map(([cat, score]) => {
            const max = MAX_SCORES[cat]
            const pct = score / max
            return (
              <div key={cat} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{cat}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{score}/{max}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(27,42,74,0.12)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--foreground)' }}>
            Your advisor will review these results and reach out shortly.
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Bookmark this page to revisit your scorecard anytime.
          </p>
        </div>
      </main>
    </div>
  )
}
