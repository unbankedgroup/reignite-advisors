'use client'

import { useState } from 'react'

const QUESTIONS = [
  { id: 1, category: 'Signal', text: 'Can you describe your offer in one clear sentence without rambling?', options: [
    { text: 'Clearly and confidently', value: 4 },
    { text: 'Mostly clear', value: 3 },
    { text: 'Somewhat unclear', value: 2 },
    { text: "No, it's not clear", value: 1 },
  ]},
  { id: 2, category: 'Signal', text: 'How clearly can someone understand what makes your work different within 30 seconds?', options: [
    { text: 'Instantly — within seconds', value: 4 },
    { text: 'Usually within 30 seconds', value: 3 },
    { text: 'Takes some explanation', value: 2 },
    { text: 'They rarely get it quickly', value: 1 },
  ]},
  { id: 3, category: 'Signal', text: 'Do you have an offer that generates value without your constant involvement?', options: [
    { text: 'Yes', value: 4 },
    { text: 'No', value: 1 },
  ]},
  { id: 4, category: 'Structure', text: 'Have you narrowed your audience to a specific group, not "leaders" or "businesses"?', options: [
    { text: 'Highly specific (role, industry, stage)', value: 4 },
    { text: 'Somewhat specific', value: 3 },
    { text: 'Broad (generic category)', value: 2 },
    { text: 'Very broad (everyone)', value: 1 },
  ]},
  { id: 5, category: 'Structure', text: 'If you stopped working for 30 days, what would happen?', options: [
    { text: 'Revenue continues (systems in place)', value: 4 },
    { text: 'Slows but continues', value: 3 },
    { text: 'Stops significantly', value: 2 },
    { text: 'Stops completely', value: 1 },
  ]},
  { id: 6, category: 'Structure', text: 'Do you have a defined progression from entry-level work to higher-value engagements?', options: [
    { text: 'Yes', value: 4 },
    { text: 'No', value: 1 },
  ]},
  { id: 7, category: 'Commercial Gravity', text: 'Is your expertise delivered through a defined framework, not just conversations?', options: [
    { text: 'Yes', value: 4 },
    { text: 'Not sure', value: 2 },
    { text: 'No', value: 1 },
  ]},
  { id: 8, category: 'Commercial Gravity', text: 'Is your offer tied to a problem with measurable financial or strategic consequences?', options: [
    { text: 'Clearly measurable', value: 4 },
    { text: 'Somewhat measurable', value: 3 },
    { text: 'Hard to quantify', value: 2 },
    { text: 'Not clearly tied to impact', value: 1 },
  ]},
  { id: 9, category: 'Commercial Gravity', text: 'Have you validated demand with paying clients?', options: [
    { text: 'Repeat paying clients', value: 4 },
    { text: 'Some paying clients', value: 3 },
    { text: 'Interest but no payments', value: 2 },
    { text: 'No validation', value: 1 },
  ]},
  { id: 10, category: 'Scale Readiness', text: 'How is your work currently priced?', options: [
    { text: 'Value or outcome-based', value: 4 },
    { text: 'Hybrid (value + time)', value: 3 },
    { text: 'Mostly time-based', value: 2 },
    { text: 'Fully time-based', value: 1 },
  ]},
  { id: 11, category: 'Scale Readiness', text: 'Which best describes your current professional situation?', options: [
    { text: 'Senior leader earning under $150K', value: 2 },
    { text: 'Senior leader earning $150K–$300K', value: 4 },
    { text: 'Independent consultant below $150K', value: 2 },
    { text: 'Founder/advisor earning $300K+', value: 5 },
  ]},
  { id: 12, category: 'Scale Readiness', text: 'Which outcome best describes your current focus?', options: [
    { text: 'Turn my experience into a premium, structured offer', value: 3 },
    { text: 'Replace or surpass my income through advisory revenue', value: 5 },
    { text: 'Build scalable leverage beyond trading time for money', value: 5 },
    { text: 'Elevate my positioning to operate at a more strategic level', value: 4 },
  ]},
  { id: 13, category: 'Scale Readiness', text: 'What is quietly holding you back from moving forward?', options: [
    { text: "I'm not fully clear on how to package what I know", value: 4 },
    { text: "I'm unsure how to position myself without narrowing too much", value: 4 },
    { text: "I question whether my experience is truly distinct", value: 2 },
    { text: "I haven't committed to structuring this properly", value: 4 },
    { text: "I'm concerned about charging at a higher level", value: 3 },
  ]},
  { id: 14, category: 'Scale Readiness', text: 'What level of support are you prepared to invest in to structure this properly?', options: [
    { text: 'Private, one-to-one advisory engagement', value: 5 },
    { text: 'Structured architecture program with direct guidance', value: 4 },
    { text: 'Defined system with limited support', value: 2 },
    { text: 'Self-guided resources only', value: 1 },
  ]},
  { id: 15, category: 'Scale Readiness', text: 'Is there anything else that would help me understand your situation?', isTextarea: true },
] as const

type Answer = { optionIndex: number; value: number; text?: string } | { text: string; value: 0 }

export default function AssessmentForm({ token, assessmentId }: { token: string; assessmentId: string }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const q = QUESTIONS[current]
  const progress = ((current + 1) / QUESTIONS.length) * 100
  const answer = answers[current]
  const isTextarea = 'isTextarea' in q && q.isTextarea
  const canAdvance = isTextarea
    ? true // text is optional
    : answer && 'optionIndex' in answer && answer.optionIndex >= 0

  function selectOption(index: number, value: number) {
    setAnswers(prev => ({ ...prev, [current]: { optionIndex: index, value } }))
  }

  function setTextAnswer(text: string) {
    setAnswers(prev => ({ ...prev, [current]: { text, value: 0 } }))
  }

  function goNext() {
    if (!canAdvance) return
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1)
    } else {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const responses = QUESTIONS.map((q, i) => {
      const a = answers[i]
      return {
        questionId: q.id,
        category: q.category,
        text: ('isTextarea' in q && q.isTextarea)
          ? (a && 'text' in a ? a.text : '')
          : ('options' in q && a && 'optionIndex' in a ? q.options[a.optionIndex].text : ''),
        value: a?.value ?? 0,
      }
    })

    const res = await fetch(`/api/assess/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses }),
    })

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6" style={{ color: 'var(--accent)' }}>✓</div>
          <h1 className="text-2xl font-light mb-4" style={{ color: 'var(--foreground)' }}>
            Thank you.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Your responses have been submitted. Your advisor will review your scorecard and be in touch shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--accent)' }}>
          Reignite Advisors
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {current + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'var(--border)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'var(--accent)' }}
        />
      </div>

      <main className="max-w-lg mx-auto px-8 py-14">
        {/* Category */}
        <div className="text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--accent)' }}>
          {q.category}
        </div>

        {/* Question */}
        <h2 className="text-xl font-light mb-10 leading-relaxed" style={{ color: 'var(--foreground)' }}>
          {q.text}
        </h2>

        {/* Options */}
        {isTextarea ? (
          <textarea
            rows={5}
            placeholder="Share as much or as little as you like…"
            value={(answer && 'text' in answer) ? answer.text : ''}
            onChange={e => setTextAnswer(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        ) : (
          <div className="space-y-3">
            {(q as { options: readonly { text: string; value: number }[] }).options.map((opt, i) => {
              const selected = answer && 'optionIndex' in answer && answer.optionIndex === i
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i, opt.value)}
                  className="w-full text-left px-5 py-4 rounded-xl text-sm transition-all"
                  style={{
                    background: selected ? `var(--accent)20` : 'var(--surface)',
                    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    color: selected ? 'var(--accent)' : 'var(--foreground)',
                  }}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

        {/* Navigation */}
        <div className="flex gap-3 mt-10">
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="px-5 py-3 rounded-xl text-sm transition-opacity hover:opacity-70"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              Back
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!canAdvance || submitting}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {submitting ? 'Submitting…' : current === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </main>
    </div>
  )
}
