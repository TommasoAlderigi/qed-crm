import { Mail, Phone, Users, FileText } from 'lucide-react'
import { InteractionForm } from './interaction-form'
import type { Interaction, InteractionType } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'

const TYPE_ICON: Record<InteractionType, React.ComponentType<{ size?: number }>> = {
  email: Mail,
  call: Phone,
  meeting: Users,
  note: FileText,
}

export async function InteractionTimeline({
  interactions,
  contactId,
  companyId,
  dealId,
}: {
  interactions: Interaction[]
  contactId?: string
  companyId?: string
  dealId?: string
}) {
  // Compact form embedded into the timeline panel
  const supabase = await createClient()
  const [contactsRes, companiesRes, dealsRes] = await Promise.all([
    supabase.from('contacts').select('id, first_name, last_name, email').order('first_name'),
    supabase.from('companies').select('id, name').order('name'),
    supabase.from('deals').select('id, title').order('title'),
  ])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Log activity</h2>
        <InteractionForm
          contacts={contactsRes.data ?? []}
          companies={companiesRes.data ?? []}
          deals={dealsRes.data ?? []}
          defaultContactId={contactId}
          defaultCompanyId={companyId}
          defaultDealId={dealId}
          compact
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <header className="px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Timeline</h2>
        </header>
        {interactions.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500 text-center">
            No activity yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {interactions.map((it) => {
              const Icon = TYPE_ICON[it.type] ?? FileText
              return (
                <li key={it.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon size={14} />
                    <span className="capitalize">{it.type}</span>
                    <span>·</span>
                    <span>{new Date(it.occurred_at).toLocaleString()}</span>
                  </div>
                  {it.subject && (
                    <div className="font-medium text-sm mt-1">{it.subject}</div>
                  )}
                  {it.body && (
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                      {it.body}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
