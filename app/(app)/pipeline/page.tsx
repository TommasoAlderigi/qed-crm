import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Kanban } from './kanban'
import type { Deal } from '@/lib/supabase/types'

type DealRow = Deal & {
  contact: { id: string; first_name: string | null; last_name: string | null } | null
  company: { id: string; name: string } | null
}

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('deals')
    .select(
      '*, contact:contacts(id, first_name, last_name), company:companies(id, name)'
    )
    .order('created_at', { ascending: false })

  const deals = (data as DealRow[] | null) ?? []

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <Link href="/pipeline/new" className="btn-primary">
          <Plus size={16} /> New deal
        </Link>
      </header>

      {deals.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No deals yet.{' '}
          <Link href="/pipeline/new" className="underline">
            Create your first
          </Link>
          .
        </div>
      ) : (
        <Kanban initialDeals={deals} />
      )}
    </div>
  )
}
