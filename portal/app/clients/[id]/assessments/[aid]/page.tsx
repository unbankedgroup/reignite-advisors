export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

const MAX_SCORES: Record<string, number> = {
  Signal: 12,
  Structure: 12,
  'Commercial Gravity': 12,
  'Scale Readiness': 23,
}

const NARRATIVES: Record<string, { low: { title: string; body: string }; med: { title: string; body: string }; high: { title: string; body: string } }> = {
  Signal: {
    low: { title: 'Your Signal Is Blurry', body: "Your positioning isn't landing. People can't quickly understand what you do or why it matters.\n\nWithout a clear signal, your expertise remains invisible — even to the right people.\n\nThe market doesn't buy what it can't explain to itself.\n\nClarity precedes credibility." },
    med: { title: 'Your Signal Is Inconsistent', body: "Some people understand your value. Others don't.\n\nThat inconsistency creates friction.\n\nYour positioning may be clear to you — but not obvious to the market.\n\nWith sharper language and a tighter audience focus, your authority will increase fast.\n\nRefinement, not reinvention." },
    high: { title: 'Your Signal Is Strong', body: "People can understand what you do quickly.\n\nYour positioning likely feels focused and intentional.\n\nThat reduces friction and increases trust.\n\nNow the opportunity is leverage — turning that clarity into scalable offers.\n\nStrong signal is a commercial advantage." },
  },
  Structure: {
    low: { title: 'Your Expertise Lives in Conversations', body: "Right now, your knowledge only works when you're present.\n\nThere's no structure that carries your value forward without you.\n\nThat means every engagement starts from zero.\n\nArchitecture turns conversations into assets.\n\nStart building." },
    med: { title: 'You Have Pieces of Structure', body: "You've started putting shape around your thinking.\n\nBut it may still rely heavily on you explaining it.\n\nSome parts are documented. Some parts live in your head.\n\nWith stronger frameworks and clearer systems, your value becomes easier to deliver — and easier to price.\n\nRefine the structure. Don't rely on presence." },
    high: { title: 'Your Thinking Is Structured', body: "Your expertise likely follows a repeatable framework.\n\nClients can see how you think — not just what you say.\n\nThat structure increases trust and perceived value instantly.\n\nNow the opportunity is turning that structure into scalable assets.\n\nArchitecture creates independence." },
  },
  'Commercial Gravity': {
    low: { title: 'Your Revenue Pull Is Weak', body: "The problem you solve may not be clearly tied to money or results.\n\nIf the impact isn't obvious, pricing becomes hard.\n\nYou may still be charging for time instead of value.\n\nWithout paying proof, momentum stays slow.\n\nRevenue follows consequence." },
    med: { title: 'Your Revenue Has Potential', body: "You solve real problems.\n\nBut the financial or strategic impact may not be fully clear to buyers.\n\nYou may still default to time-based pricing in some cases.\n\nWith stronger value alignment and clearer outcomes, your pricing power increases.\n\nClarity strengthens commercial gravity." },
    high: { title: 'Your Revenue Has Gravity', body: "The problems you solve are clearly tied to real consequence.\n\nClients understand the value — and pay for outcomes, not hours.\n\nYour pricing reflects impact.\n\nPaying clients signal proof, not just potential.\n\nStrong commercial gravity creates momentum." },
  },
  'Scale Readiness': {
    low: { title: 'Your Growth Depends on You', body: "Every result currently requires your direct involvement.\n\nThere are no systems creating value while you're not working.\n\nThis limits your capacity, your pricing, and your income ceiling.\n\nArchitecture matters. Build the structure first." },
    med: { title: "You've Started Building Leverage", body: "You may have early systems or repeatable processes.\n\nBut growth still depends heavily on your involvement.\n\nSome independence exists — but it's not fully intentional.\n\nWith stronger design, scale becomes sustainable.\n\nRefine the structure before pushing growth." },
    high: { title: "You're Built for Scale", body: "Your revenue is not fully tied to your time.\n\nYou likely have structured offers, defined processes, or leverage layers in place.\n\nGrowth feels designed — not forced.\n\nScale happens when effort is replaced with architecture.\n\nYou're thinking beyond effort." },
  },
}

function getNarrative(category: string, score: number, max: number) {
  const pct = score / max
  const n = NARRATIVES[category]
  if (!n) return null
  if (pct >= 0.75) return n.high
  if (pct >= 0.45) return n.med
  return n.low
}

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string; aid: string }>
}) {
  const { id, aid } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', aid)
    .eq('client_id', id)
    .single()

  if (!assessment) notFound()

  const { data: client } = await supabase
    .from('clients')
    .select('name, company')
    .eq('id', id)
    .single()

  if (assessment.status !== 'completed' || !assessment.responses) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Nav active="clients" />
        <main className="max-w-2xl mx-auto px-8 py-12 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            This assessment has not been completed yet.
          </p>
          <Link href={`/clients/${id}`} className="text-sm mt-4 inline-block" style={{ color: 'var(--accent)' }}>
            ← Back to client
          </Link>
        </main>
      </div>
    )
  }

  const responses: { questionId: number; category: string; text: string; value: number }[] = assessment.responses

  // Compute category scores
  const catScores: Record<string, number> = { Signal: 0, Structure: 0, 'Commercial Gravity': 0, 'Scale Readiness': 0 }
  for (const r of responses) {
    if (catScores[r.category] !== undefined) {
      catScores[r.category] += r.value
    }
  }

  const totalScore = Object.values(catScores).reduce((a, b) => a + b, 0)
  const totalMax = Object.values(MAX_SCORES).reduce((a, b) => a + b, 0)
  const completedAt = assessment.completed_at
    ? new Date(assessment.completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const freeformAnswer = responses.find(r => r.questionId === 15)?.text

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-2xl mx-auto px-8 py-12">
        <Link href={`/clients/${id}`} className="text-xs mb-6 inline-block" style={{ color: 'var(--muted)' }}>
          ← {client?.name ?? 'Client'}
        </Link>

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-light" style={{ color: 'var(--foreground)' }}>
              Experience-to-Asset Scorecard
            </h1>
            {completedAt && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Completed {completedAt}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-light" style={{ color: 'var(--accent)' }}>
              {totalScore}<span className="text-base text-opacity-50">/{totalMax}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Total Score</div>
          </div>
        </div>

        {/* Category scores */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {Object.entries(catScores).map(([cat, score]) => {
            const max = MAX_SCORES[cat]
            const pct = score / max
            const narrative = getNarrative(cat, score, max)
            return (
              <div key={cat} className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{cat}</span>
                  <span className="text-sm" style={{ color: 'var(--accent)' }}>{score}/{max}</span>
                </div>
                <div className="h-1 rounded-full mb-3" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct * 100}%`, background: 'var(--accent)' }}
                  />
                </div>
                {narrative && (
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {narrative.title}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Detailed narratives */}
        <h2 className="text-xs uppercase tracking-widest mb-5" style={{ color: 'var(--muted)' }}>
          Detailed Analysis
        </h2>
        <div className="space-y-4 mb-10">
          {Object.entries(catScores).map(([cat, score]) => {
            const max = MAX_SCORES[cat]
            const narrative = getNarrative(cat, score, max)
            if (!narrative) return null
            return (
              <div key={cat} className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>{cat}</div>
                <div className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>{narrative.title}</div>
                <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--muted)' }}>
                  {narrative.body}
                </div>
              </div>
            )
          })}
        </div>

        {/* Response detail */}
        <h2 className="text-xs uppercase tracking-widest mb-5" style={{ color: 'var(--muted)' }}>
          Responses
        </h2>
        <div className="rounded-xl overflow-hidden mb-10" style={{ border: '1px solid var(--border)' }}>
          {responses.filter(r => r.questionId !== 15).map((r, i) => (
            <div
              key={r.questionId}
              className="px-6 py-4"
              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>{r.text || '—'}</div>
                <div className="text-xs shrink-0 px-2 py-0.5 rounded" style={{ background: `var(--accent)20`, color: 'var(--accent)' }}>
                  {r.value} pts
                </div>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Q{r.questionId} · {r.category}</div>
            </div>
          ))}
        </div>

        {freeformAnswer && (
          <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
              Additional Context
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {freeformAnswer}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
