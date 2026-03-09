
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { responses, first_name, last_name, email, company } = await req.json()

  const supabase = createAdminClient()

  // Update the assessment as completed
  const { error } = await supabase
    .from('assessments')
    .update({
      responses,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('token', token)
    .eq('status', 'pending')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also create a leads entry with the contact info so it appears in the advisor dashboard
  if (email) {
    const score = Array.isArray(responses)
      ? responses.reduce((sum: number, r: { value?: number }) => sum + (r.value ?? 0), 0)
      : null

    const name = [first_name, last_name].filter(Boolean).join(' ') || email

    await supabase.from('leads').insert({
      name,
      email,
      first_name: first_name || null,
      last_name: last_name || null,
      company: company || null,
      responses: responses ?? null,
      score,
    })
  }

  return NextResponse.json({ success: true })
}
