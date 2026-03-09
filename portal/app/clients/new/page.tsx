'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    status: 'prospect',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('clients').insert({
      ...form,
      advisor_id: user?.id,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/clients')
    router.refresh()
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--accent)' }}>
          Reignite Advisors
        </span>
        <Link href="/clients" className="text-sm" style={{ color: 'var(--muted)' }}>← Back to Clients</Link>
      </nav>

      <main className="max-w-lg mx-auto px-8 py-12">
        <h1 className="text-xl font-light mb-8" style={{ color: 'var(--foreground)' }}>Add Client</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Full Name *" value={form.name} onChange={v => set('name', v)} required />
          <Field label="Email *" type="email" value={form.email} onChange={v => set('email', v)} required />
          <Field label="Company" value={form.company} onChange={v => set('company', v)} />
          <Field label="Role / Title" value={form.role} onChange={v => set('role', v)} />

          <div>
            <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-1"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-1 resize-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {loading ? 'Saving...' : 'Add Client'}
          </button>
        </form>
      </main>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required = false
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-1"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      />
    </div>
  )
}
