'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

function parseTags(s: FormDataEntryValue | null): string[] {
  if (s === null) return []
  return String(s)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export async function createContact(formData: FormData) {
  const { supabase, userId } = await getUserId()
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      owner: userId,
      first_name: nonEmpty(formData.get('first_name')),
      last_name: nonEmpty(formData.get('last_name')),
      email: nonEmpty(formData.get('email')),
      phone: nonEmpty(formData.get('phone')),
      title: nonEmpty(formData.get('title')),
      company_id: nonEmpty(formData.get('company_id')),
      tags: parseTags(formData.get('tags')),
      notes: nonEmpty(formData.get('notes')),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  redirect(`/contacts/${data.id}`)
}

export async function updateContact(id: string, formData: FormData) {
  const { supabase } = await getUserId()
  const { error } = await supabase
    .from('contacts')
    .update({
      first_name: nonEmpty(formData.get('first_name')),
      last_name: nonEmpty(formData.get('last_name')),
      email: nonEmpty(formData.get('email')),
      phone: nonEmpty(formData.get('phone')),
      title: nonEmpty(formData.get('title')),
      company_id: nonEmpty(formData.get('company_id')),
      tags: parseTags(formData.get('tags')),
      notes: nonEmpty(formData.get('notes')),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
}

export async function deleteContact(id: string) {
  const { supabase } = await getUserId()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  redirect('/contacts')
}
