export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*, assessments(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-light" style={{ color: 'var(--foreground)' }}>Clients</h1>
          <Link
            href="/clients/new"
            className="text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            + Add Client
          </Link>
        </div>

        {!clients || clients.length === 0 ? (
          <div className="text-center py-20 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>No clients yet.</p>
            <Link href="/clients/new" className="text-sm" style={{ color: 'var(--accent)' }}>
              Add your first client →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-3" style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Company', 'Email', 'Status', ''].map((h, i) => (
                <div key={i} className={`text-xs uppercase tracking-wider col-span-${[3,3,3,2,1][i]}`} style={{ color: 'var(--muted)' }}>{h}</div>
              ))}
            </div>
            {clients.map((client, i) => (
              <div
                key={client.id}
                className="grid grid-cols-12 px-6 py-4 items-center"
                style={{
                  background: 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="col-span-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>{client.name}</div>
                <div className="col-span-3 text-sm" style={{ color: 'var(--muted)' }}>{client.company ?? '—'}</div>
                <div className="col-span-3 text-sm" style={{ color: 'var(--muted)' }}>{client.email}</div>
                <div className="col-span-2">
                  <StatusBadge status={client.status} />
                </div>
                <div className="col-span-1 text-right">
                  <Link href={`/clients/${client.id}`} className="text-xs" style={{ color: 'var(--accent)' }}>View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
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
