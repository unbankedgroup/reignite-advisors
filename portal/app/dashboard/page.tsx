
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: assessments } = await supabase
    .from('assessments')
    .select('status')

  const total = clients?.length ?? 0
  const active = clients?.filter(c => c.status === 'active').length ?? 0
  const completed = assessments?.filter(a => a.status === 'completed').length ?? 0
  const recent = clients?.slice(0, 5) ?? []

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
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total Clients', value: total },
            { label: 'Active', value: active },
            { label: 'Assessments Completed', value: completed },
          ].map(stat => (
            <div key={stat.label} className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent clients */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Recent Clients
          </h2>
          <Link
            href="/clients/new"
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            + Add Client
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              No clients yet. They appear automatically when someone submits your form.
            </p>
            <Link href="/clients/new" className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Or add one manually →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {recent.map((client, i) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between px-6 py-4 hover:opacity-80 transition-opacity"
                style={{
                  background: i % 2 === 0 ? '#fff' : 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{client.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{client.company ?? client.email}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                  <StatusBadge status={client.status} />
                </div>
              </Link>
            ))}
            {(clients?.length ?? 0) > 5 && (
              <div className="px-6 py-3" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <Link href="/clients" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                  View all {clients?.length} clients →
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active:   { bg: '#dcfce7', color: '#166534' },
    prospect: { bg: '#fff7ed', color: '#9a3412' },
    inactive: { bg: '#f5f5f5', color: '#525252' },
  }
  const s = map[status] ?? map.inactive
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}
