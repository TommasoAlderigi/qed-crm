'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DealStage } from '@/lib/supabase/types'

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

function parseNumber(s: FormDataEntryValue | null): number | null {
  const v = nonEmpty(s)
  if (v === null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const VALID_STAGES: DealStage[] = ['lead', 'qualified', 'proposal', 'won', 'lost']

export async function createDeal(formData: FormData) {
  const { supabase, userId } = await getUserId()
  const title = nonEmpty(formData.get('title'))
  if (!title) throw new Error('Title is required')

  const stage = (formData.get('stage') as DealStage) || 'lead'
  if (!VALID_STAGES.includes(stage)) throw new Error('Invalid stage')

  const { error } = await supabase.from('deals').insert({
    owner: userId,
    title,
    value: parseNumber(formData.get('value')) ?? 0,
    currency: nonEmpty(formData.get('currency')) ?? 'USD',
    stage,
    contact_id: nonEmpty(formData.get('contact_id')),
    company_id: nonEmpty(formData.get('company_id')),
    expected_close_date: nonEmpty(formData.get('expected_close_date')),
    notes: nonEmpty(formData.get('notes')),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/pipeline')
  redirect('/pipeline')
}

export async function updateDealStage(id: string, stage: DealStage) {
  if (!VALID_STAGES.includes(stage)) throw new Error('Invalid stage')
  const { supabase } = await getUserId()
  const { error } = await supabase
    .from('deals')
    .update({ stage })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
}

export async function deleteDeal(id: string) {
  const { supabase } = await getUserId()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/pipeline')
}
