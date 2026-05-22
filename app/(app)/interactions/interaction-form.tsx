'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { INTERACTION_TYPES, type Contact, type Company, type Deal } from '@/lib/supabase/types'
import { createInteraction } from './actions'

function nowLocal(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function InteractionForm({
  contacts,
  companies,
  deals,
  defaultContactId,
  defaultCompanyId,
  defaultDealId,
  redirectTo,
  compact,
}: {
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'email'>[]
  companies: Pick<Company, 'id' | 'name'>[]
  deals: Pick<Deal, 'id' | 'title'>[]
  defaultContactId?: string
  defaultCompanyId?: string
  defaultDealId?: string
  redirectTo?: string
  compact?: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => startTransition(() => createInteraction(fd))}
      className="space-y-4"
    >
      {redirectTo && <input type="hidden" name="redirect_to" value={redirectTo} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue="note">
            {INTERACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="occurred_at">When</label>
          <input
            id="occurred_at"
            name="occurred_at"
            type="datetime-local"
            defaultValue={nowLocal()}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          placeholder="Follow-up on proposal"
        />
      </div>

      <div>
        <label htmlFor="body">
          Notes / email content
        </label>
        <textarea
          id="body"
          name="body"
          rows={compact ? 4 : 8}
          placeholder="Paste the email body or jot down meeting notes…"
        />
      </div>

      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="contact_id">Contact</label>
            <select
              id="contact_id"
              name="contact_id"
              defaultValue={defaultContactId ?? ''}
            >
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
            <select
              id="company_id"
              name="company_id"
              defaultValue={defaultCompanyId ?? ''}
            >
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="deal_id">Deal</label>
            <select
              id="deal_id"
              name="deal_id"
              defaultValue={defaultDealId ?? ''}
            >
              <option value="">— None —</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {compact && (
        <>
          {defaultContactId && (
            <input type="hidden" name="contact_id" value={defaultContactId} />
          )}
          {defaultCompanyId && (
            <input type="hidden" name="company_id" value={defaultCompanyId} />
          )}
          {defaultDealId && (
            <input type="hidden" name="deal_id" value={defaultDealId} />
          )}
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? 'Logging…' : 'Log activity'}
        </button>
        {!compact && (
          <Link href="/interactions" className="btn-secondary">
            Cancel
          </Link>
        )}
      </div>
    </form>
  )
}
