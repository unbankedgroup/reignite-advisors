
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import ConvertLeadButton from '@/components/ConvertLeadButton'

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

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const total = clients?.length ?? 0
  const active = clients?.filter(c => c.status === 'active').length ?? 0
  const pending = assessments?.filter(a => a.status === 'pending').length ?? 0
  const completed = assessments?.filter(a => a.status === 'completed').length ?? 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="dashboard" />

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-light mb-1" style={{ color: 'var(--foreground)' }}>
            Good {getGreeting()}, {user.user_metadata?.name?.split(' ')[0] ?? 'Advisor'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Clients', value: total },
            { label: 'Active', value: active },
            { label: 'Assessments Sent', value: pending + completed },
            { label: 'Completed', value: completed },
          ].map(stat => (
            <div key={stat.label} className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-light mb-1" style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Inbound leads */}
        {leads && leads.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium tracking-wide uppercase mb-5" style={{ color: 'var(--muted)' }}>
              Inbound Leads
            </h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {leads.map((lead, i) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between px-6 py-4"
                  style={{
                    background: 'var(--surface)',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{lead.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{lead.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    <ConvertLeadButton leadId={lead.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent clients */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
            Recent Clients
          </h2>
          <Link
            href="/clients/new"
            className="text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            + Add Client
          </Link>
        </div>

        {!clients || clients.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>No clients yet.</p>
            <Link href="/clients/new" className="text-sm" style={{ color: 'var(--accent)' }}>
              Add your first client →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {clients.slice(0, 5).map((client, i) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between px-6 py-4 hover:opacity-80 transition-opacity"
                style={{
                  background: 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{client.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{client.company ?? client.email}</div>
                </div>
                <StatusBadge status={client.status} />
              </Link>
            ))}
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
  const colors: Record<string, string> = {
    active: '#22c55e',
    prospect: '#c9a84c',
    inactive: '#6b6b6b',
  }
  return (
    <span className="text-xs px-2.5 py-1 rounded-full" style={{
      background: `${colors[status] ?? '#6b6b6b'}20`,
      color: colors[status] ?? '#6b6b6b',
    }}>
      {status}
    </span>
  )
}
