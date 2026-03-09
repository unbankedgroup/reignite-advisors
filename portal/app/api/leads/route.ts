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
    const { name, first_name, last_name, email, company, responses, score } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400, headers: CORS })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('leads').insert({
      name: name || [first_name, last_name].filter(Boolean).join(' ') || email,
      first_name: first_name || null,
      last_name: last_name || null,
      email,
      company: company || null,
      responses: responses ?? null,
      score: score ?? null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
    }

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS })
  }
}
