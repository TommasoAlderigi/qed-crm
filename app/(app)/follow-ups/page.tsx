import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { markFollowUpDone } from './actions'
import type { Interaction, Contact, Company } from '@/lib/supabase/types'

type FollowUpRow = Interaction & {
  contact: Pick<Contact, 'id' | 'first_name' | 'last_name'> | null
  company: Pick<Company, 'id' | 'name'> | null
}

function MarkDoneButton({ id }: { id: string }) {
  const action = markFollowUpDone.bind(null, id)
  return (
    <form action={action}>
      <button
        type="submit"
        className="btn-secondary text-xs whitespace-nowrap"
        title="Mark this follow-up as done"
      >
        ✓ Done
      </button>
    </form>
  )
}

export default async function FollowUpsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('interactions')
    .select(
      '*, contact:contacts(id, first_name, last_name), company:companies(id, name)'
    )
    .not('follow_up', 'is', null)
    .eq('follow_up_done', false)
    .order('follow_up_due', { ascending: true, nullsFirst: false })
    .order('occurred_at', { ascending: false })

  const rows = (data as FollowUpRow[] | null) ?? []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Follow-ups</h1>
        <p className="text-sm text-slate-500 mt-1">
          Open actions captured from your interactions. {rows.length} open.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No open follow-ups. 🎉
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const contactName = r.contact
              ? [r.contact.first_name, r.contact.last_name]
                  .filter(Boolean)
                  .join(' ')
              : null
            const due = r.follow_up_due ? new Date(r.follow_up_due) : null
            const overdue = due ? due < today : false
            const dueSoon =
              due && !overdue
                ? (due.getTime() - today.getTime()) / 86400000 <= 3
                : false

            return (
              <li
                key={r.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">{r.follow_up}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    {due && (
                      <span
                        className={`inline-block rounded px-2 py-0.5 font-medium ${
                          overdue
                            ? 'bg-rose-100 text-rose-700'
                            : dueSoon
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {overdue ? 'Overdue · ' : 'Due '}
                        {due.toLocaleDateString()}
                      </span>
                    )}
                    {contactName && r.contact && (
                      <Link
                        href={`/contacts/${r.contact.id}`}
                        className="bg-slate-100 rounded px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                      >
                        {contactName}
                      </Link>
                    )}
                    {r.company && (
                      <Link
                        href={`/companies/${r.company.id}`}
                        className="bg-slate-100 rounded px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                      >
                        {r.company.name}
                      </Link>
                    )}
                    <span className="text-slate-400">
                      from {r.type} · {new Date(r.occurred_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <MarkDoneButton id={r.id} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
