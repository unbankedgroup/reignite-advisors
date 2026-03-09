import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default function Nav({ active }: { active?: string }) {
  return (
    <nav
      className="flex items-center justify-between px-8 py-5"
      style={{ background: '#fff', borderBottom: '1px solid rgba(27,42,74,0.08)' }}
    >
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-0">
          <span style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            REIGNITE
          </span>
          <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1, marginLeft: '-1px' }}>.</span>
        </div>
        <span style={{ color: 'var(--accent)', fontSize: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '4px', marginTop: '1px' }}>
          ADVISORS
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="text-sm transition-colors"
          style={{ color: active === 'dashboard' ? 'var(--navy)' : 'var(--muted)', fontWeight: active === 'dashboard' ? 700 : 400 }}
        >
          Dashboard
        </Link>
        <Link
          href="/clients"
          className="text-sm transition-colors"
          style={{ color: active === 'clients' ? 'var(--navy)' : 'var(--muted)', fontWeight: active === 'clients' ? 700 : 400 }}
        >
          Clients
        </Link>
        <SignOutButton />
      </div>
    </nav>
  )
}
