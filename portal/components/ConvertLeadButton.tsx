'use client'

import { useState } from 'react'
import { convertLeadToClient } from '@/app/actions/convertLead'

export default function ConvertLeadButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await convertLeadToClient(leadId)
      setDone(true)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <span className="text-xs" style={{ color: 'var(--accent)' }}>Added</span>
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
      style={{ background: 'var(--accent)', color: '#000' }}
    >
      {loading ? '…' : '+ Add as Client'}
    </button>
  )
}
