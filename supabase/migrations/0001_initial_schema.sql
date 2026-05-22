-- CRM initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Idempotent: safe to re-run.

-- =====================================================
-- Enums
-- =====================================================
do $$ begin
  create type public.deal_stage as enum ('lead', 'qualified', 'proposal', 'won', 'lost');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.interaction_type as enum ('email', 'call', 'meeting', 'note', 'linkedin');
exception when duplicate_object then null;
end $$;

-- If the enum already exists from an earlier version, make sure 'linkedin' is present.
alter type public.interaction_type add value if not exists 'linkedin';

-- =====================================================
-- Tables
-- =====================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  name text not null,
  domain text,
  industry text,
  size text,
  website text,
  notes text,
  agents_summary text,
  org_structure text,
  account_strategy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backwards-compatible: add columns if the table already exists
alter table public.companies add column if not exists agents_summary text;
alter table public.companies add column if not exists org_structure text;
alter table public.companies add column if not exists people_spoken_with text;
alter table public.companies add column if not exists account_strategy text;

create index if not exists companies_owner_idx on public.companies(owner);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  first_name text,
  last_name text,
  email text,
  phone text,
  title text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_owner_idx on public.contacts(owner);
create index if not exists contacts_company_idx on public.contacts(company_id);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  title text not null,
  value numeric(12,2) default 0,
  currency text not null default 'USD',
  stage public.deal_stage not null default 'lead',
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  expected_close_date date,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_owner_idx on public.deals(owner);
create index if not exists deals_stage_idx on public.deals(stage);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  type public.interaction_type not null default 'note',
  subject text,
  body text,
  occurred_at timestamptz not null default now(),
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  follow_up text,
  follow_up_due date,
  follow_up_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Backwards-compatible: add follow-up columns if the table already exists
alter table public.interactions add column if not exists follow_up text;
alter table public.interactions add column if not exists follow_up_due date;
alter table public.interactions add column if not exists follow_up_done boolean not null default false;

create index if not exists interactions_owner_idx on public.interactions(owner);
create index if not exists interactions_contact_idx on public.interactions(contact_id);
create index if not exists interactions_company_idx on public.interactions(company_id);
create index if not exists interactions_deal_idx on public.interactions(deal_id);

-- =====================================================
-- updated_at trigger
-- =====================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_updated_at on public.companies;
create trigger companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists deals_updated_at on public.deals;
create trigger deals_updated_at before update on public.deals
  for each row execute function public.set_updated_at();

-- =====================================================
-- Grants (required so the authenticated role can see tables at all;
-- RLS then restricts which rows.)
-- =====================================================
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.deals to authenticated;
grant select, insert, update, delete on public.interactions to authenticated;

-- =====================================================
-- Row Level Security
-- =====================================================
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.interactions enable row level security;

-- Drop existing policies to allow re-running this migration
drop policy if exists "Owner can read companies" on public.companies;
drop policy if exists "Owner can insert companies" on public.companies;
drop policy if exists "Owner can update companies" on public.companies;
drop policy if exists "Owner can delete companies" on public.companies;

drop policy if exists "Owner can read contacts" on public.contacts;
drop policy if exists "Owner can insert contacts" on public.contacts;
drop policy if exists "Owner can update contacts" on public.contacts;
drop policy if exists "Owner can delete contacts" on public.contacts;

drop policy if exists "Owner can read deals" on public.deals;
drop policy if exists "Owner can insert deals" on public.deals;
drop policy if exists "Owner can update deals" on public.deals;
drop policy if exists "Owner can delete deals" on public.deals;

drop policy if exists "Owner can read interactions" on public.interactions;
drop policy if exists "Owner can insert interactions" on public.interactions;
drop policy if exists "Owner can update interactions" on public.interactions;
drop policy if exists "Owner can delete interactions" on public.interactions;

create policy "Owner can read companies" on public.companies
  for select using (auth.uid() = owner);
create policy "Owner can insert companies" on public.companies
  for insert with check (auth.uid() = owner);
create policy "Owner can update companies" on public.companies
  for update using (auth.uid() = owner);
create policy "Owner can delete companies" on public.companies
  for delete using (auth.uid() = owner);

create policy "Owner can read contacts" on public.contacts
  for select using (auth.uid() = owner);
create policy "Owner can insert contacts" on public.contacts
  for insert with check (auth.uid() = owner);
create policy "Owner can update contacts" on public.contacts
  for update using (auth.uid() = owner);
create policy "Owner can delete contacts" on public.contacts
  for delete using (auth.uid() = owner);

create policy "Owner can read deals" on public.deals
  for select using (auth.uid() = owner);
create policy "Owner can insert deals" on public.deals
  for insert with check (auth.uid() = owner);
create policy "Owner can update deals" on public.deals
  for update using (auth.uid() = owner);
create policy "Owner can delete deals" on public.deals
  for delete using (auth.uid() = owner);

create policy "Owner can read interactions" on public.interactions
  for select using (auth.uid() = owner);
create policy "Owner can insert interactions" on public.interactions
  for insert with check (auth.uid() = owner);
create policy "Owner can update interactions" on public.interactions
  for update using (auth.uid() = owner);
create policy "Owner can delete interactions" on public.interactions
  for delete using (auth.uid() = owner);
