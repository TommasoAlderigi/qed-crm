import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateCompany, deleteCompany } from '../actions'
import { CompanyForm } from '../company-form'
import { CompanyLogo } from '@/app/(app)/components/company-logo'
import { InteractionForm } from '@/app/(app)/interactions/interaction-form'
import type {
  Company,
  Contact,
  Deal,
  DealStage,
  Interaction,
  InteractionType,
} from '@/lib/supabase/types'
import { DEAL_STAGES } from '@/lib/supabase/types'

const TYPE_LABEL: Record<InteractionType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  linkedin: 'LinkedIn',
  note: 'Note',
}

const STAGE_STYLE: Record<DealStage, string> = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.value, s.color])
) as Record<DealStage, string>

const STAGE_LABEL: Record<DealStage, string> = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.value, s.label])
) as Record<DealStage, string>

function Markdown({ text }: { text: string }) {
  // Tiny inline renderer: bold via **…**, preserve newlines.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  )
}

function EmptySection({ label, hint }: { label: string; hint: string }) {
  return (
    <p className="text-sm text-slate-400 italic">
      No {label.toLowerCase()} captured yet. {hint}
    </p>
  )
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [companyRes, contactsRes, dealsRes, interactionsRes] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('contacts')
      .select('id, first_name, last_name, email, phone, title, tags')
      .eq('company_id', id)
      .order('first_name'),
    supabase
      .from('deals')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('interactions')
      .select('*')
      .eq('company_id', id)
      .order('occurred_at', { ascending: false }),
  ])

  if (companyRes.error || !companyRes.data) notFound()
  const company = companyRes.data as Company
  const contacts = (contactsRes.data as Contact[] | null) ?? []
  const deals = (dealsRes.data as Deal[] | null) ?? []
  const interactions = (interactionsRes.data as Interaction[] | null) ?? []

  const updateAction = updateCompany.bind(null, id)
  const deleteAction = deleteCompany.bind(null, id)

  const metaParts = [company.industry, company.size].filter(Boolean)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/companies"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Companies
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <CompanyLogo
              domain={company.domain}
              name={company.name}
              size={56}
              rounded="md"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold truncate">{company.name}</h1>
              {metaParts.length > 0 && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {metaParts.join(' · ')}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-sm">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={14} /> {company.domain ?? company.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agents */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Agents they are building
            </h2>
            {company.agents_summary ? (
              <Markdown text={company.agents_summary} />
            ) : (
              <EmptySection
                label="agents"
                hint="Edit the company to add a summary of their AI agents."
              />
            )}
          </section>

          {/* Org structure */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Org structure
            </h2>
            {company.org_structure ? (
              <Markdown text={company.org_structure} />
            ) : (
              <EmptySection
                label="org structure"
                hint="Edit the company to describe their divisions, hierarchy, or how the org is laid out."
              />
            )}
          </section>

          {/* Who we spoke with */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Who we spoke with
            </h2>
            {company.people_spoken_with ? (
              <Markdown text={company.people_spoken_with} />
            ) : (
              <EmptySection
                label="people"
                hint="Edit the company to list named contacts we've engaged."
              />
            )}
          </section>

          {/* Account strategy */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Account strategy
            </h2>
            {company.account_strategy ? (
              <Markdown text={company.account_strategy} />
            ) : (
              <EmptySection
                label="strategy"
                hint="Edit the company to describe the plan."
              />
            )}
          </section>

          {/* Timeline */}
          <section className="bg-white border border-slate-200 rounded-lg">
            <header className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Interaction timeline ({interactions.length})
              </h2>
            </header>
            {interactions.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500 text-center">
                No interactions logged yet.
              </div>
            ) : (
              <ol className="divide-y divide-slate-100">
                {interactions.map((it) => (
                  <li key={it.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium uppercase tracking-wide text-slate-600">
                        {TYPE_LABEL[it.type] ?? it.type}
                      </span>
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
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Contacts */}
          <section className="bg-white border border-slate-200 rounded-lg">
            <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contacts ({contacts.length})
              </h2>
              <Link
                href="/contacts/new"
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                + Add
              </Link>
            </header>
            {contacts.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500 text-center">
                No contacts yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {contacts.map((c) => {
                  const name =
                    [c.first_name, c.last_name].filter(Boolean).join(' ') || '—'
                  return (
                    <li key={c.id} className="px-5 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {name}
                      </Link>
                      {c.title && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.title}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 text-xs text-slate-500 mt-1">
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1 hover:text-slate-700"
                          >
                            <Mail size={12} /> {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} /> {c.phone}
                          </span>
                        )}
                      </div>
                      {c.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-block bg-slate-100 rounded px-1.5 py-0.5 text-[10px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Deals */}
          <section className="bg-white border border-slate-200 rounded-lg">
            <header className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Deals ({deals.length})
              </h2>
            </header>
            {deals.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500 text-center">
                No deals yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {deals.map((d) => (
                  <li key={d.id} className="px-5 py-3">
                    <div className="text-sm font-medium text-slate-900">
                      {d.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${STAGE_STYLE[d.stage]}`}
                      >
                        {STAGE_LABEL[d.stage]}
                      </span>
                      {d.expected_close_date && (
                        <span className="text-xs text-slate-500">
                          close{' '}
                          {new Date(d.expected_close_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick log */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Log activity
            </h2>
            <QuickLog companyId={id} />
          </section>

          {/* Edit & Delete */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Edit company
            </h2>
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-600 hover:text-slate-900">
                Show edit form
              </summary>
              <div className="mt-4">
                <CompanyForm company={company} action={updateAction} />
              </div>
            </details>
            <form action={deleteAction} className="mt-6 pt-4 border-t border-slate-200">
              <button type="submit" className="btn-danger w-full">
                Delete company
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  )
}

async function QuickLog({ companyId }: { companyId: string }) {
  const supabase = await createClient()
  const [contactsRes, dealsRes] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, first_name, last_name, email')
      .eq('company_id', companyId)
      .order('first_name'),
    supabase
      .from('deals')
      .select('id, title')
      .eq('company_id', companyId)
      .order('title'),
  ])
  return (
    <InteractionForm
      contacts={contactsRes.data ?? []}
      companies={[]}
      deals={dealsRes.data ?? []}
      defaultCompanyId={companyId}
      compact
    />
  )
}
