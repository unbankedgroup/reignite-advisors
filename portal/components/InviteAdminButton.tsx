'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InviteAdminButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'advisor' | 'admin'>('advisor')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function invite() {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('admins').insert({
      email: email.trim().toLowerCase(),
      role,
    })
    if (err) {
      setError(err.message.includes('unique') ? 'This email already has access.' : err.message)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setDone(false); setEmail(''); setRole('advisor') }, 1500)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        + Invite Advisor
      </button>
    )
  }

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && invite()}
          placeholder="advisor@example.com"
          autoFocus
          className="text-sm px-3 py-2 rounded-lg outline-none"
          style={{ border: '1px solid var(--border)', color: 'var(--foreground)', width: '220px' }}
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Role</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value as 'advisor' | 'admin')}
          className="text-sm px-3 py-2 rounded-lg outline-none"
          style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          <option value="advisor">Advisor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        onClick={invite}
        disabled={loading || done}
        className="text-sm px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ background: done ? '#166534' : 'var(--accent)', color: '#fff' }}
      >
        {done ? 'Added ✓' : loading ? '…' : 'Add'}
      </button>
      <button onClick={() => setOpen(false)} className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
        Cancel
      </button>
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}
