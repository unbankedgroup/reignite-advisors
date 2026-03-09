
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Clients</h1>
        </div>

        {!leads || leads.length === 0 ? (
          <div className="text-center py-20 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No submissions yet. They'll appear here when someone fills out your form.
            </p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-12 px-6 py-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Date', 'Score', ''].map((h, i) => (
                <div
                  key={i}
                  className={`text-xs font-semibold uppercase tracking-wider col-span-${[3, 4, 2, 2, 1][i]}`}
                  style={{ color: 'var(--muted)' }}
                >
                  {h}
                </div>
              ))}
            </div>
            {leads.map((lead, i) => (
              <div
                key={lead.id}
                className="grid grid-cols-12 px-6 py-4 items-center"
                style={{
                  background: i % 2 === 0 ? '#fff' : 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="col-span-3 text-sm font-semibold" style={{ color: 'var(--navy)' }}>{lead.name}</div>
                <div className="col-span-4 text-sm" style={{ color: 'var(--muted)' }}>{lead.email}</div>
                <div className="col-span-2 text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  {lead.score != null ? (
                    <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#fff7ed', color: '#9a3412' }}>
                      {lead.score} pts
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>—</span>
                  )}
                </div>
                <div className="col-span-1 text-right">
                  <Link href={`/clients/${lead.id}`} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
