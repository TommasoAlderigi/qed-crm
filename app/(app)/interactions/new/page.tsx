import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { InteractionForm } from '../interaction-form'

export default async function NewInteractionPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string; company?: string; deal?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const [contactsRes, companiesRes, dealsRes] = await Promise.all([
    supabase.from('contacts').select('id, first_name, last_name, email').order('first_name'),
    supabase.from('companies').select('id, name').order('name'),
    supabase.from('deals').select('id, title').order('title'),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/interactions"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Activity
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Log activity</h1>
      </div>
      <InteractionForm
        contacts={contactsRes.data ?? []}
        companies={companiesRes.data ?? []}
        deals={dealsRes.data ?? []}
        defaultContactId={params.contact}
        defaultCompanyId={params.company}
        defaultDealId={params.deal}
        redirectTo="/interactions"
      />
    </div>
  )
}
