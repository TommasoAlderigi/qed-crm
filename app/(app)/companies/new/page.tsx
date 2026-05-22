import Link from 'next/link'
import { createCompany } from '../actions'
import { CompanyForm } from '../company-form'

export default function NewCompanyPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/companies"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Companies
        </Link>
        <h1 className="text-2xl font-semibold mt-1">New company</h1>
      </div>
      <CompanyForm action={createCompany} />
    </div>
  )
}
