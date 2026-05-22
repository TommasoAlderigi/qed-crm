import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CompanyLogo } from '@/app/(app)/components/company-logo'
import type { Company } from '@/lib/supabase/types'

type CompanyRow = Company & { contacts: { count: number }[] }

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('*, contacts(count)')
    .order('name')

  const companies = (data as CompanyRow[] | null) ?? []

  return (
    <div className="p-8 max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <Link href="/companies/new" className="btn-primary">
          <Plus size={16} /> New company
        </Link>
      </header>

      {companies.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No companies yet.{' '}
          <Link href="/companies/new" className="underline">
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
                <th className="text-left px-4 py-2 font-medium">Domain</th>
                <th className="text-left px-4 py-2 font-medium">Industry</th>
                <th className="text-left px-4 py-2 font-medium">Contacts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        domain={c.domain}
                        name={c.name}
                        size={28}
                        rounded="md"
                      />
                      <Link
                        href={`/companies/${c.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{c.domain ?? ''}</td>
                  <td className="px-4 py-2 text-slate-700">{c.industry ?? ''}</td>
                  <td className="px-4 py-2 text-slate-700">
                    {c.contacts?.[0]?.count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
