
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { responses } = await req.json()

  const supabase = await createAdminClient()

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

  return NextResponse.json({ success: true })
}
