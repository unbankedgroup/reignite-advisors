'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SendAssessmentButton({
  clientId,
  clientEmail,
}: {
  clientId: string
  clientEmail: string
}) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function send() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('assessments').insert({
      client_id: clientId,
      advisor_id: user?.id,
      status: 'pending',
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={send}
      disabled={loading}
      className="text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{ background: 'var(--accent)', color: '#000' }}
    >
      {loading ? 'Sending...' : '+ Send Assessment'}
    </button>
  )
}
