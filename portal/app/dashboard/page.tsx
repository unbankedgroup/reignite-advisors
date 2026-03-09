
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import DashboardLeadsTable from '@/components/DashboardLeadsTable'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, first_name, last_name, email, score, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="dashboard" />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
            Good {getGreeting()}, {user.user_metadata?.name?.split(' ')[0] ?? 'Advisor'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <DashboardLeadsTable leads={leads ?? []} />
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
