import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Contact, Company } from '@/lib/supabase/types'

type ContactWithCompany = Contact & { company: Pick<Company, 'id' | 'name'> | null }

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contacts')
    .select('*, company:companies(id, name)')
    .order('created_at', { ascending: false })

  const contacts = (data as ContactWithCompany[] | null) ?? []

  return (
    <div className="p-8 max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <Link href="/contacts/new" className="btn-primary">
          <Plus size={16} /> New contact
        </Link>
      </header>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No contacts yet.{' '}
          <Link href="/contacts/new" className="underline">
            Add your first
          </Link>
          .
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Company</th>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((c) => {
                const name =
                  [c.first_name, c.last_name].filter(Boolean).join(' ') || '—'
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-700">{c.email ?? ''}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {c.company ? (
                        <Link
                          href={`/companies/${c.company.id}`}
                          className="hover:underline"
                        >
                          {c.company.name}
                        </Link>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-700">{c.title ?? ''}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-block bg-slate-100 rounded px-2 py-0.5 text-xs mr-1"
                        >
                          {t}
                        </span>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
