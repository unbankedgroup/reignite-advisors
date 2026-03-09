'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RemoveAdminButton({ adminId }: { adminId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function remove() {
    setLoading(true)
    await supabase.from('admins').delete().eq('id', adminId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={remove}
          disabled={loading}
          className="text-xs px-2.5 py-1 rounded-lg font-semibold"
          style={{ background: '#ef4444', color: '#fff' }}
        >
          {loading ? '…' : 'Remove'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2.5 py-1 rounded-lg"
          style={{ color: 'var(--muted)' }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-70"
      style={{ color: '#ef4444', border: '1px solid #fecaca' }}
    >
      Remove
    </button>
  )
}
