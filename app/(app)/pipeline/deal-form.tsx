'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { DEAL_STAGES, type Contact, type Company } from '@/lib/supabase/types'

export function DealForm({
  contacts,
  companies,
  action,
}: {
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'email'>[]
  companies: Pick<Company, 'id' | 'name'>[]
  action: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => startTransition(() => action(fd))}
      className="space-y-5"
    >
      <div>
        <label htmlFor="title">Title *</label>
        <input id="title" name="title" required placeholder="Acme – Annual contract" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="value">Value</label>
          <input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <input id="currency" name="currency" defaultValue="USD" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="stage">Stage</label>
          <select id="stage" name="stage" defaultValue="lead">
            {DEAL_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="expected_close_date">Expected close</label>
          <input id="expected_close_date" name="expected_close_date" type="date" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_id">Contact</label>
          <select id="contact_id" name="contact_id" defaultValue="">
            <option value="">— None —</option>
            {contacts.map((c) => {
              const label =
                [c.first_name, c.last_name].filter(Boolean).join(' ') ||
                c.email ||
                c.id.slice(0, 8)
              return (
                <option key={c.id} value={c.id}>
                  {label}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label htmlFor="company_id">Company</label>
          <select id="company_id" name="company_id" defaultValue="">
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
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={4} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? 'Saving…' : 'Create deal'}
        </button>
        <Link href="/pipeline" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
