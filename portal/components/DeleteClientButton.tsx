'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    await supabase.from('clients').delete().eq('id', clientId)
    router.push('/clients')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: '#ef4444', color: '#fff' }}
        >
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-70"
          style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-70"
      style={{ color: '#ef4444', border: '1px solid #fecaca', background: '#fff5f5' }}
    >
      Delete
    </button>
  )
}
