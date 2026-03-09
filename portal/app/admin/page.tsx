
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import InviteAdminButton from '@/components/InviteAdminButton'
import RemoveAdminButton from '@/components/RemoveAdminButton'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use service-role client to read admins table (bypasses RLS which can
  // silently fail on Cloudflare Workers due to cookie-based auth quirks)
  const adminClient = createAdminClient()

  const { data: me } = await adminClient
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isAdmin = me?.role === 'admin'

  const { data: admins } = await adminClient
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Nav active="admin" />

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Access Management</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {isAdmin ? 'You have admin access.' : 'You have advisor access.'}
            </p>
          </div>
          {isAdmin && <InviteAdminButton />}
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Header row */}
          <div className="grid grid-cols-12 px-6 py-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            {['Email', 'Role', 'Added', ''].map((h, i) => (
              <div
                key={i}
                className={`text-xs font-semibold uppercase tracking-wider col-span-${[5, 2, 3, 2][i]}`}
                style={{ color: 'var(--muted)' }}
              >
                {h}
              </div>
            ))}
          </div>

          {!admins || admins.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
              No admins yet. Run the seed SQL in Supabase to add yourself first.
            </div>
          ) : (
            admins.map((admin, i) => (
              <div
                key={admin.id}
                className="grid grid-cols-12 px-6 py-4 items-center"
                style={{
                  background: i % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="col-span-5">
                  <div className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                    {admin.email}
                    {admin.user_id === user.id && (
                      <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted)' }}>(you)</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={
                      admin.role === 'admin'
                        ? { background: '#ede9fe', color: '#6d28d9' }
                        : { background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }
                    }
                  >
                    {admin.role}
                  </span>
                </div>
                <div className="col-span-3 text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="col-span-2 flex justify-end">
                  {isAdmin && admin.user_id !== user.id && (
                    <RemoveAdminButton adminId={admin.id} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Setup instructions — only shown when no admins exist yet */}
        {(!admins || admins.length === 0) && (
          <div className="mt-8 p-5 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#92400e' }}>First-time setup</div>
            <p className="text-sm mb-3" style={{ color: '#78350f' }}>
              Run this in your <strong>Supabase SQL Editor</strong> to seed yourself as the first admin, then refresh this page:
            </p>
            <pre className="text-xs p-3 rounded-lg overflow-x-auto" style={{ background: '#fff7ed', color: '#7c2d12' }}>
{`insert into admins (user_id, email, role)
select id, email, 'admin'
from auth.users
where email = '${user.email}';`}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
