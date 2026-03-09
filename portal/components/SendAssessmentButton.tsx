'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SendAssessmentButton({
  clientId,
}: {
  clientId: string
  clientEmail: string
}) {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function send() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
      .from('assessments')
      .insert({ client_id: clientId, advisor_id: user?.id, status: 'pending' })
      .select('token')
      .single()

    setLoading(false)

    if (data?.token) {
      const url = `${window.location.origin}/assess/${data.token}`
      setLink(url)
      await navigator.clipboard.writeText(url).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }

    router.refresh()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (link) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs truncate max-w-[200px]" style={{ color: 'var(--muted)' }}>{link}</span>
        <button
          onClick={copyLink}
          className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 shrink-0"
          style={{ background: copied ? '#22c55e20' : 'var(--surface)', color: copied ? '#22c55e' : 'var(--accent)', border: '1px solid var(--border)' }}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={send}
      disabled={loading}
      className="text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{ background: 'var(--accent)', color: '#000' }}
    >
      {loading ? 'Creating…' : '+ Send Assessment'}
    </button>
  )
}
