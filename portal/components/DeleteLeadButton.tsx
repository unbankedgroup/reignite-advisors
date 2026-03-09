'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const { error } = await res.json()
      alert(error || 'Failed to delete lead')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: '#991b1b' }}
      >
        Delete this lead
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm" style={{ color: 'var(--muted)' }}>
        Are you sure? This cannot be undone.
      </span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ background: '#991b1b', color: '#fff' }}
      >
        {loading ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        Cancel
      </button>
    </div>
  )
}
