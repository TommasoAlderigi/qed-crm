import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateContact, deleteContact } from '../actions'
import { ContactForm } from '../contact-form'
import { InteractionTimeline } from '@/app/(app)/interactions/interaction-timeline'
import type { Contact, Interaction } from '@/lib/supabase/types'

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [contactRes, companiesRes, interactionsRes] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', id).single(),
    supabase.from('companies').select('id, name').order('name'),
    supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', id)
      .order('occurred_at', { ascending: false }),
  ])

  if (contactRes.error || !contactRes.data) notFound()
  const contact = contactRes.data as Contact
  const name =
    [contact.first_name, contact.last_name].filter(Boolean).join(' ') ||
    contact.email ||
    'Contact'

  const updateAction = updateContact.bind(null, id)
  const deleteAction = deleteContact.bind(null, id)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/contacts" className="text-sm text-slate-500 hover:text-slate-700">
          ← Contacts
        </Link>
        <h1 className="text-2xl font-semibold mt-1">{name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Details</h2>
          <ContactForm
            contact={contact}
            companies={companiesRes.data ?? []}
            action={updateAction}
          />
          <form action={deleteAction} className="mt-8 pt-6 border-t border-slate-200">
            <button type="submit" className="btn-danger">
              Delete contact
            </button>
          </form>
        </section>

        <aside>
          <InteractionTimeline
            interactions={(interactionsRes.data as Interaction[] | null) ?? []}
            contactId={id}
          />
        </aside>
      </div>
    </div>
  )
}
