import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default function Nav({ active }: { active?: string }) {
  return (
    <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--accent)' }}>
        Reignite Advisors
      </span>
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="text-sm transition-opacity hover:opacity-100"
          style={{ color: active === 'dashboard' ? 'var(--foreground)' : 'var(--muted)' }}
        >
          Dashboard
        </Link>
        <Link
          href="/clients"
          className="text-sm transition-opacity hover:opacity-100"
          style={{ color: active === 'clients' ? 'var(--foreground)' : 'var(--muted)' }}
        >
          Clients
        </Link>
        <SignOutButton />
      </div>
    </nav>
  )
}
