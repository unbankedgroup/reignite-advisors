'use client'

import { useState } from 'react'

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

type Response = { questionId: number; category: string; text: string; value: number }

export default function CollapsibleResponses({ responses }: { responses: Response[] }) {
  const [open, setOpen] = useState(false)
  const mainResponses = responses.filter(r => r.questionId !== 15)
  const freeform = responses.find(r => r.questionId === 15)?.text

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--navy)' }}
      >
        <span>Question Responses</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="mt-3">
          <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
            {mainResponses.map((r, i) => (
              <div
                key={r.questionId}
                className="px-6 py-4"
                style={{
                  background: i % 2 === 0 ? 'var(--background)' : 'var(--surface)',
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
                    style={{ background: 'var(--accent)20', color: 'var(--accent)' }}
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
        </div>
      )}
    </div>
  )
}
