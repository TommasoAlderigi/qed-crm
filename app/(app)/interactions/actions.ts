'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { InteractionType } from '@/lib/supabase/types'

async function getUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, userId: user.id }
}

function nonEmpty(s: FormDataEntryValue | null): string | null {
  if (s === null) return null
  const v = String(s).trim()
  return v.length === 0 ? null : v
}

export async function createInteraction(formData: FormData) {
  const { supabase, userId } = await getUserId()

  const occurredRaw = nonEmpty(formData.get('occurred_at'))
  const occurred_at = occurredRaw ? new Date(occurredRaw).toISOString() : new Date().toISOString()

  const { error } = await supabase.from('interactions').insert({
    owner: userId,
    type: (formData.get('type') as InteractionType) || 'note',
    subject: nonEmpty(formData.get('subject')),
    body: nonEmpty(formData.get('body')),
    occurred_at,
    contact_id: nonEmpty(formData.get('contact_id')),
    company_id: nonEmpty(formData.get('company_id')),
    deal_id: nonEmpty(formData.get('deal_id')),
  })

  if (error) throw new Error(error.message)

  const contactId = nonEmpty(formData.get('contact_id'))
  const companyId = nonEmpty(formData.get('company_id'))
  const dealId = nonEmpty(formData.get('deal_id'))
  const redirectTo = nonEmpty(formData.get('redirect_to'))

  revalidatePath('/interactions')
  revalidatePath('/dashboard')
  if (contactId) revalidatePath(`/contacts/${contactId}`)
  if (companyId) revalidatePath(`/companies/${companyId}`)
  if (dealId) revalidatePath('/pipeline')

  if (redirectTo) redirect(redirectTo)
}

export async function deleteInteraction(id: string, redirectTo?: string) {
  const { supabase } = await getUserId()
  const { error } = await supabase.from('interactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/interactions')
  if (redirectTo) revalidatePath(redirectTo)
}
