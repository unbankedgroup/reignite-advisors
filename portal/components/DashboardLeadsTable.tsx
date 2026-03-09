'use client'

import { useState } from 'react'
import Link from 'next/link'

const TOTAL_MAX = 59

type Lead = {
  id: string
  name: string
  first_name?: string | null
  last_name?: string | null
  email: string
  score?: number | null
  responses?: unknown
  created_at: string
}

type Tier = 'Top' | 'Average' | 'Poor' | null

function getTier(score: number | null | undefined): Tier {
  if (score == null) return null
  const pct = score / TOTAL_MAX
  if (pct > 0.63) return 'Top'
  if (pct > 0.25) return 'Average'
  return 'Poor'
}

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  Top:     { bg: '#dcfce7', color: '#166534' },
  Average: { bg: '#fef9c3', color: '#854d0e' },
  Poor:    { bg: '#fee2e2', color: '#991b1b' },
}

type FilterVal = 'All' | 'Top' | 'Average' | 'Poor'
type SortVal = 'newest' | 'score_desc' | 'score_asc'

export default function DashboardLeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<FilterVal>('All')
  const [sort, setSort] = useState<SortVal>('newest')

  const total = leads.length
  const topCount     = leads.filter(l => getTier(l.score) === 'Top').length
  const avgCount     = leads.filter(l => getTier(l.score) === 'Average').length
  const poorCount    = leads.filter(l => getTier(l.score) === 'Poor').length

  let filtered = filter === 'All' ? leads : leads.filter(l => getTier(l.score) === filter)

  filtered = [...filtered].sort((a, b) => {
    if (sort === 'score_desc') return (b.score ?? -1) - (a.score ?? -1)
    if (sort === 'score_asc')  return (a.score ?? -1) - (b.score ?? -1)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {[
          { label: 'Total Leads', value: total, filter: 'All' as FilterVal, color: 'var(--accent)' },
          { label: 'Top',         value: topCount,  filter: 'Top' as FilterVal,     color: '#166534', bg: '#dcfce7' },
          { label: 'Avg',         value: avgCount,  filter: 'Average' as FilterVal, color: '#854d0e', bg: '#fef9c3' },
          { label: 'Poor',        value: poorCount, filter: 'Poor' as FilterVal,    color: '#991b1b', bg: '#fee2e2' },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filter)}
            className="p-4 sm:p-6 rounded-xl text-left transition-all hover:opacity-80"
            style={{
              background: filter === stat.filter ? (stat.bg ?? 'var(--surface)') : 'var(--surface)',
              border: filter === stat.filter ? `2px solid ${stat.color}` : '1px solid var(--border)',
            }}
          >
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Table header with dropdown sort */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          {filter === 'All' ? 'All Clients' : `${filter} Clients`}
          {filtered.length !== total && <span className="ml-2 font-normal">({filtered.length})</span>}
        </h2>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortVal)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="newest">Newest first</option>
          <option value="score_desc">Score: high to low</option>
          <option value="score_asc">Score: low to high</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No clients in this bucket yet.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {filtered.map((lead, i) => {
            const tier = getTier(lead.score)
            const tierStyle = tier ? TIER_STYLES[tier] : null
            const displayName = (lead.first_name && lead.last_name)
              ? `${lead.first_name} ${lead.last_name}`
              : (lead.first_name || lead.last_name || lead.name)
            return (
              <Link
                key={lead.id}
                href={`/clients/${lead.id}`}
                className="flex items-start sm:items-center justify-between px-4 sm:px-6 py-4 hover:opacity-80 transition-opacity gap-3"
                style={{
                  background: i % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--navy)' }}>{displayName}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{lead.email}</div>
                  <div className="text-xs mt-1 sm:hidden" style={{ color: 'var(--muted)' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="hidden sm:inline text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  {lead.score != null && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: 'var(--accent)20', color: 'var(--accent)' }}
                    >
                      {lead.score}/{TOTAL_MAX}
                    </span>
                  )}
                  {tierStyle ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: tierStyle.bg, color: tierStyle.color }}>
                      {tier}
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                      no score
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
