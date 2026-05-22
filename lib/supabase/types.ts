export type DealStage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost'
export type InteractionType = 'email' | 'call' | 'meeting' | 'note'

export const DEAL_STAGES: { value: DealStage; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-blue-100 text-blue-700' },
  { value: 'proposal', label: 'Proposal', color: 'bg-amber-100 text-amber-700' },
  { value: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'lost', label: 'Lost', color: 'bg-rose-100 text-rose-700' },
]

export const INTERACTION_TYPES: { value: InteractionType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
]

export interface Company {
  id: string
  owner: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  owner: string
  company_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  title: string | null
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  owner: string
  title: string
  value: number | null
  currency: string
  stage: DealStage
  contact_id: string | null
  company_id: string | null
  expected_close_date: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  owner: string
  type: InteractionType
  subject: string | null
  body: string | null
  occurred_at: string
  contact_id: string | null
  company_id: string | null
  deal_id: string | null
  created_at: string
}

