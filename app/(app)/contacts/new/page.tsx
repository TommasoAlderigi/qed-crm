import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createContact } from '../actions'
import { ContactForm } from '../contact-form'

export default async function NewContactPage() {
  const supabase = await createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .order('name')

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/contacts" className="text-sm text-slate-500 hover:text-slate-700">
          ← Contacts
        </Link>
        <h1 className="text-2xl font-semibold mt-1">New contact</h1>
      </div>
      <ContactForm companies={companies ?? []} action={createContact} />
    </div>
  )
}
