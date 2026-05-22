import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCompany, deleteCompany } from '../actions'
import { CompanyForm } from '../company-form'
import { InteractionTimeline } from '@/app/(app)/interactions/interaction-timeline'
import type { Company, Contact, Interaction } from '@/lib/supabase/types'

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [companyRes, contactsRes, interactionsRes] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('contacts')
      .select('id, first_name, last_name, email, title')
      .eq('company_id', id)
      .order('first_name'),
    supabase
      .from('interactions')
      .select('*')
      .eq('company_id', id)
      .order('occurred_at', { ascending: false }),
  ])

  if (companyRes.error || !companyRes.data) notFound()
  const company = companyRes.data as Company

  const updateAction = updateCompany.bind(null, id)
  const deleteAction = deleteCompany.bind(null, id)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link
          href="/companies"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Companies
        </Link>
        <h1 className="text-2xl font-semibold mt-1">{company.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Details</h2>
            <CompanyForm company={company} action={updateAction} />
            <form action={deleteAction} className="mt-8 pt-6 border-t border-slate-200">
              <button type="submit" className="btn-danger">
                Delete company
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg">
            <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">
                Contacts ({(contactsRes.data as Contact[] | null)?.length ?? 0})
              </h2>
              <Link
                href="/contacts/new"
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                + Add
              </Link>
            </header>
            {(contactsRes.data?.length ?? 0) === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500 text-center">
                No contacts at this company yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(contactsRes.data as Contact[]).map((c) => {
                  const name =
                    [c.first_name, c.last_name].filter(Boolean).join(' ') || '—'
                  return (
                    <li key={c.id} className="px-5 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {[c.title, c.email].filter(Boolean).join(' · ')}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <aside>
          <InteractionTimeline
            interactions={(interactionsRes.data as Interaction[] | null) ?? []}
            companyId={id}
          />
        </aside>
      </div>
    </div>
  )
}
