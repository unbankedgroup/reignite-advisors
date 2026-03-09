import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import SendAssessmentButton from '@/components/SendAssessmentButton'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href="/clients" className="text-xs mb-3 inline-block" style={{ color: 'var(--muted)' }}>
              ← Clients
            </Link>
            <h1 className="text-2xl font-light" style={{ color: 'var(--foreground)' }}>{client.name}</h1>
            {client.company && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                {client.role ? `${client.role}, ` : ''}{client.company}
              </p>
            )}
          </div>
          <StatusBadge status={client.status} />
        </div>

        {/* Info */}
        <div className="p-6 rounded-xl mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 gap-6">
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Added" value={new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            {client.notes && <div className="col-span-2"><InfoRow label="Notes" value={client.notes} /></div>}
          </div>
        </div>

        {/* Assessments */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
            Assessments
          </h2>
          <SendAssessmentButton clientId={client.id} clientEmail={client.email} />
        </div>

        {!assessments || assessments.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No assessments sent yet.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {assessments.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-6 py-4"
                style={{ background: 'var(--surface)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
                  <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                    Assessment #{i + 1}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    Sent {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={a.status} />
                  {a.status === 'completed' && (
                    <Link href={`/clients/${id}/assessments/${a.id}`} className="text-xs" style={{ color: 'var(--accent)' }}>
                      View Results →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="text-sm" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#22c55e',
    prospect: '#c9a84c',
    inactive: '#6b6b6b',
    completed: '#22c55e',
    pending: '#c9a84c',
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
