'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import type { Company, Contact } from '@/lib/supabase/types'

export function ContactForm({
  contact,
  companies,
  action,
}: {
  contact?: Contact
  companies: Pick<Company, 'id' | 'name'>[]
  action: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => startTransition(() => action(fd))}
      className="space-y-5 max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            defaultValue={contact?.first_name ?? ''}
          />
        </div>
        <div>
          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            defaultValue={contact?.last_name ?? ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ''}
          />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={contact?.phone ?? ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={contact?.title ?? ''} />
        </div>
        <div>
          <label htmlFor="company_id">Company</label>
          <select
            id="company_id"
            name="company_id"
            defaultValue={contact?.company_id ?? ''}
          >
            <option value="">— None —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          name="tags"
          defaultValue={contact?.tags?.join(', ') ?? ''}
          placeholder="prospect, vip"
        />
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={contact?.notes ?? ''}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? 'Saving…' : contact ? 'Save changes' : 'Create contact'}
        </button>
        <Link href="/contacts" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
