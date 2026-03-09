
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const total = leads?.length ?? 0
  const withAssessment = leads?.filter(l => l.responses && Array.isArray(l.responses) && l.responses.length > 0).length ?? 0
  const recent = leads?.slice(0, 10) ?? []

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="dashboard" />

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
            Good {getGreeting()}, {user.user_metadata?.name?.split(' ')[0] ?? 'Advisor'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {[
            { label: 'Total Submissions', value: total },
            { label: 'Assessments Completed', value: withAssessment },
          ].map(stat => (
            <div key={stat.label} className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Leads list */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Clients
          </h2>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No submissions yet. They'll appear here when someone fills out your form.
            </p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {recent.map((lead, i) => (
              <Link
                key={lead.id}
                href={`/clients/${lead.id}`}
                className="flex items-center justify-between px-6 py-4 hover:opacity-80 transition-opacity"
                style={{
                  background: i % 2 === 0 ? '#fff' : 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{lead.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{lead.email}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  {lead.score != null && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-bold"
                      style={{ background: '#fff7ed', color: '#9a3412' }}
                    >
                      {lead.score} pts
                    </span>
                  )}
                  {lead.responses ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
                      assessed
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#f5f5f5', color: '#525252' }}>
                      no assessment
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {(leads?.length ?? 0) > 10 && (
              <div className="px-6 py-3" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <Link href="/clients" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                  View all {leads?.length} clients →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
