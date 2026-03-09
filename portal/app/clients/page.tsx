
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import DashboardLeadsTable from '@/components/DashboardLeadsTable'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, first_name, last_name, email, score, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="clients" />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
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
          <DashboardLeadsTable leads={leads} />
        )}
      </main>
    </div>
  )
}
