'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function convertLeadToClient(leadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const admin = await createAdminClient()

  // Fetch the lead
  const { data: lead, error: leadError } = await admin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) throw new Error('Lead not found')

  // Insert as client assigned to current advisor
  const { error: clientError } = await admin
    .from('clients')
    .insert({
      name: lead.name,
      email: lead.email,
      advisor_id: user.id,
      status: 'prospect',
    })

  if (clientError) throw new Error(clientError.message)

  revalidatePath('/dashboard')
  revalidatePath('/clients')
}
