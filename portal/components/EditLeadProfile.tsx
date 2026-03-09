'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type LeadProfile = {
  id: string
  name: string
  first_name?: string | null
  last_name?: string | null
  email: string
  company?: string | null
  linkedin?: string | null
  phone?: string | null
  city?: string | null
  country?: string | null
}

export default function EditLeadProfile({ lead }: { lead: LeadProfile }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: lead.first_name ?? '',
    last_name: lead.last_name ?? '',
    email: lead.email,
    company: lead.company ?? '',
    linkedin: lead.linkedin ?? '',
    phone: lead.phone ?? '',
    city: lead.city ?? '',
    country: lead.country ?? '',
  })
  const [saved, setSaved] = useState(form)
  const supabase = createClient()

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    setSaving(true)
    await supabase.from('leads').update({
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      email: form.email,
      company: form.company || null,
      linkedin: form.linkedin || null,
      phone: form.phone || null,
      city: form.city || null,
      country: form.country || null,
    }).eq('id', lead.id)
    setSaved(form)
    setSaving(false)
    setEditing(false)
  }

  function cancel() {
    setForm(saved)
    setEditing(false)
  }

  const PencilIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )

  if (!editing) {
    return (
      <div className="p-6 rounded-xl mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Profile</span>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <PencilIcon /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <InfoRow label="First Name" value={saved.first_name || '—'} />
          <InfoRow label="Last Name" value={saved.last_name || '—'} />
          <InfoRow label="Email" value={saved.email} />
          <InfoRow label="Phone" value={saved.phone || '—'} />
          <InfoRow label="Company" value={saved.company || '—'} />
          <InfoRow label="LinkedIn" value={saved.linkedin || '—'} />
          <InfoRow label="City" value={saved.city || '—'} />
          <InfoRow label="Country" value={saved.country || '—'} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Edit Profile</span>
        <div className="flex items-center gap-2">
          <button
            onClick={cancel}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditField label="First Name" value={form.first_name} onChange={v => set('first_name', v)} />
        <EditField label="Last Name" value={form.last_name} onChange={v => set('last_name', v)} />
        <EditField label="Email" value={form.email} onChange={v => set('email', v)} type="email" />
        <EditField label="Phone" value={form.phone} onChange={v => set('phone', v)} type="tel" />
        <EditField label="Company" value={form.company} onChange={v => set('company', v)} />
        <EditField label="LinkedIn" value={form.linkedin} onChange={v => set('linkedin', v)} />
        <EditField label="City" value={form.city} onChange={v => set('city', v)} />
        <EditField label="Country" value={form.country} onChange={v => set('country', v)} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="text-sm break-all" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
  )
}

function EditField({
  label, value, onChange, type = 'text'
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      />
    </div>
  )
}
