import { createClient } from '@supabase/supabase-js'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function createAdminClient() {
  const cfEnv = (await getCloudflareContext()).env as Record<string, string>
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? cfEnv.NEXT_PUBLIC_SUPABASE_URL
  const key = cfEnv.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
