import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createDeal } from '../actions'
import { DealForm } from '../deal-form'

export default async function NewDealPage() {
  const supabase = await createClient()
  const [contactsRes, companiesRes] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, first_name, last_name, email')
      .order('first_name'),
    supabase.from('companies').select('id, name').order('name'),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/pipeline"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Pipeline
        </Link>
        <h1 className="text-2xl font-semibold mt-1">New deal</h1>
      </div>
      <DealForm
        contacts={contactsRes.data ?? []}
        companies={companiesRes.data ?? []}
        action={createDeal}
      />
    </div>
  )
}
