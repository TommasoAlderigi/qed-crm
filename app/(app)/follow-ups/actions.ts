'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return supabase
}

export async function markFollowUpDone(id: string) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from('interactions')
    .update({ follow_up_done: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/follow-ups')
  revalidatePath('/dashboard')
}

export async function reopenFollowUp(id: string) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from('interactions')
    .update({ follow_up_done: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/follow-ups')
}
