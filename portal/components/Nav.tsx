import Link from 'next/link'
import ProfileMenu from './ProfileMenu'

function RLogo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <rect x="6" y="6" width="128" height="128" rx="16" fill="#1B2A4A" stroke="#FF6B35" strokeWidth="5"/>
      <text x="30" y="100" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="80" fontWeight="800" fill="#fff">R</text>
      <circle cx="100" cy="36" r="10" fill="#FF6B35"/>
    </svg>
  )
}

export { RLogo }

export default function Nav({ active }: { active?: string }) {
  return (
    <nav
      className="flex items-center justify-between px-4 sm:px-8 py-4"
      style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
    >
      <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <RLogo />
        <div className="hidden sm:flex" style={{ flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '2px' }}>REIGNITE</span>
          <span style={{ fontSize: '0.5rem', fontWeight: 600, color: '#FF6B35', letterSpacing: '3px', marginTop: '3px' }}>ADVISORS</span>
        </div>
      </a>

      <div className="flex items-center gap-3 sm:gap-6">
        <Link
          href="/dashboard"
          className="text-sm transition-colors"
          style={{ color: active === 'dashboard' ? 'var(--navy)' : 'var(--muted)', fontWeight: active === 'dashboard' ? 700 : 400 }}
        >
          Dashboard
        </Link>
        <ProfileMenu />
      </div>
    </nav>
  )
}
