'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import type { Company } from '@/lib/supabase/types'

export function CompanyForm({
  company,
  action,
}: {
  company?: Company
  action: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => startTransition(() => action(fd))}
      className="space-y-5 max-w-2xl"
    >
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={company?.name ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="domain">Domain</label>
          <input
            id="domain"
            name="domain"
            placeholder="acme.com"
            defaultValue={company?.domain ?? ''}
          />
        </div>
        <div>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://acme.com"
            defaultValue={company?.website ?? ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="industry">Industry</label>
          <input
            id="industry"
            name="industry"
            defaultValue={company?.industry ?? ''}
          />
        </div>
        <div>
          <label htmlFor="size">Size</label>
          <input
            id="size"
            name="size"
            placeholder="1-10, 11-50, 51-200…"
            defaultValue={company?.size ?? ''}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={company?.notes ?? ''}
        />
      </div>

      <div>
        <label htmlFor="agents_summary">Agents they are building</label>
        <textarea
          id="agents_summary"
          name="agents_summary"
          rows={6}
          placeholder="Markdown supported. Use **bold** for headings."
          defaultValue={company?.agents_summary ?? ''}
        />
      </div>

      <div>
        <label htmlFor="org_structure">Org structure</label>
        <textarea
          id="org_structure"
          name="org_structure"
          rows={5}
          placeholder="Departments, divisions, hierarchy. Anything about how the company is structured."
          defaultValue={company?.org_structure ?? ''}
        />
      </div>

      <div>
        <label htmlFor="people_spoken_with">Who we spoke with</label>
        <textarea
          id="people_spoken_with"
          name="people_spoken_with"
          rows={5}
          placeholder="- **Name** — role / context"
          defaultValue={company?.people_spoken_with ?? ''}
        />
      </div>

      <div>
        <label htmlFor="account_strategy">Account strategy</label>
        <textarea
          id="account_strategy"
          name="account_strategy"
          rows={5}
          placeholder="Plan, watchouts, champion…"
          defaultValue={company?.account_strategy ?? ''}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? 'Saving…' : company ? 'Save changes' : 'Create company'}
        </button>
        <Link href="/companies" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
