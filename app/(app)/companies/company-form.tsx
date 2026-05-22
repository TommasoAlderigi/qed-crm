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
