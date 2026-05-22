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

export async function createCompany(formData: FormData) {
  const { supabase, userId } = await getUserId()
  const name = nonEmpty(formData.get('name'))
  if (!name) throw new Error('Company name is required')

  const { data, error } = await supabase
    .from('companies')
    .insert({
      owner: userId,
      name,
      domain: nonEmpty(formData.get('domain')),
      industry: nonEmpty(formData.get('industry')),
      size: nonEmpty(formData.get('size')),
      website: nonEmpty(formData.get('website')),
      notes: nonEmpty(formData.get('notes')),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/companies')
  redirect(`/companies/${data.id}`)
}

export async function updateCompany(id: string, formData: FormData) {
  const { supabase } = await getUserId()
  const name = nonEmpty(formData.get('name'))
  if (!name) throw new Error('Company name is required')

  const { error } = await supabase
    .from('companies')
    .update({
      name,
      domain: nonEmpty(formData.get('domain')),
      industry: nonEmpty(formData.get('industry')),
      size: nonEmpty(formData.get('size')),
      website: nonEmpty(formData.get('website')),
      notes: nonEmpty(formData.get('notes')),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/companies')
  revalidatePath(`/companies/${id}`)
}

export async function deleteCompany(id: string) {
  const { supabase } = await getUserId()
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/companies')
  redirect('/companies')
}
