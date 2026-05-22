import Link from 'next/link'
import { Plus, Mail, Phone, Users as UsersIcon, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type {
  Interaction,
  InteractionType,
  Contact,
  Company,
  Deal,
} from '@/lib/supabase/types'

type InteractionRow = Interaction & {
  contact: Pick<Contact, 'id' | 'first_name' | 'last_name'> | null
  company: Pick<Company, 'id' | 'name'> | null
  deal: Pick<Deal, 'id' | 'title'> | null
}

const TYPE_ICON: Record<InteractionType, React.ComponentType<{ size?: number }>> = {
  email: Mail,
  call: Phone,
  meeting: UsersIcon,
  note: FileText,
}

export default async function InteractionsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('interactions')
    .select(
      '*, contact:contacts(id, first_name, last_name), company:companies(id, name), deal:deals(id, title)'
    )
    .order('occurred_at', { ascending: false })

  const interactions = (data as InteractionRow[] | null) ?? []

  return (
    <div className="p-8 max-w-4xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <Link href="/interactions/new" className="btn-primary">
          <Plus size={16} /> Log activity
        </Link>
      </header>

      {interactions.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No activity yet.{' '}
          <Link href="/interactions/new" className="underline">
            Log your first interaction
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {interactions.map((it) => {
            const Icon = TYPE_ICON[it.type] ?? FileText
            const contactName = it.contact
              ? [it.contact.first_name, it.contact.last_name]
                  .filter(Boolean)
                  .join(' ') || 'Unnamed contact'
              : null
            return (
              <li
                key={it.id}
                className="bg-white border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon size={14} />
                  <span className="capitalize font-medium text-slate-700">
                    {it.type}
                  </span>
                  <span>·</span>
                  <span>{new Date(it.occurred_at).toLocaleString()}</span>
                </div>
                {it.subject && (
                  <div className="font-medium mt-1">{it.subject}</div>
                )}
                {it.body && (
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap line-clamp-6">
                    {it.body}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                  {contactName && it.contact && (
                    <Link
                      href={`/contacts/${it.contact.id}`}
                      className="bg-slate-100 rounded px-2 py-0.5 hover:bg-slate-200"
                    >
                      {contactName}
                    </Link>
                  )}
                  {it.company && (
                    <Link
                      href={`/companies/${it.company.id}`}
                      className="bg-slate-100 rounded px-2 py-0.5 hover:bg-slate-200"
                    >
                      {it.company.name}
                    </Link>
                  )}
                  {it.deal && (
                    <Link
                      href={`/pipeline`}
                      className="bg-slate-100 rounded px-2 py-0.5 hover:bg-slate-200"
                    >
                      {it.deal.title}
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
