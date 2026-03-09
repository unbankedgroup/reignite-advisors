import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, responses, score } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400, headers: CORS })
    }

    const supabase = createAdminClient()

    // Store the lead for the record
    await supabase.from('leads').insert({ name, email, responses, score: score ?? null })

    // Auto-create client — skip if this email already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!existing) {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ name, email, status: 'prospect' })
        .select('id')
        .single()

      // Store their assessment responses as a completed assessment
      if (newClient && responses && Array.isArray(responses) && responses.length > 0) {
        await supabase.from('assessments').insert({
          client_id: newClient.id,
          token: crypto.randomUUID(),
          status: 'completed',
          responses,
          completed_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS })
  }
}
