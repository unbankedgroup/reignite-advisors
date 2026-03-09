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

    const _debug = { url: !!process.env.NEXT_PUBLIC_SUPABASE_URL, key: !!process.env.SUPABASE_SERVICE_ROLE_KEY }
    if (!_debug.url || !_debug.key) {
      return NextResponse.json({ error: 'missing env', debug: _debug }, { status: 500, headers: CORS })
    }
    const supabase = createAdminClient()

    const { error } = await supabase.from('leads').insert({
      name,
      email,
      responses,
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
