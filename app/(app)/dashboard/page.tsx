import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Deal, Interaction } from '@/lib/supabase/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [contactsCount, companiesCount, openDealsCount, recentInteractions, openDeals] =
    await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase
        .from('deals')
        .select('id', { count: 'exact', head: true })
        .not('stage', 'in', '(won,lost)'),
      supabase
        .from('interactions')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(10),
      supabase
        .from('deals')
        .select('*')
        .not('stage', 'in', '(won,lost)'),
    ])

  const pipelineValue = ((openDeals.data as Deal[] | null) ?? []).reduce(
    (sum, d) => sum + (Number(d.value) || 0),
    0
  )

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Contacts" value={contactsCount.count ?? 0} href="/contacts" />
        <StatCard label="Companies" value={companiesCount.count ?? 0} href="/companies" />
        <StatCard label="Open deals" value={openDealsCount.count ?? 0} href="/pipeline" />
        <StatCard
          label="Pipeline value"
          value={pipelineValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          })}
          href="/pipeline"
        />
      </div>

      <section className="bg-white rounded-lg border border-slate-200">
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Recent activity</h2>
          <Link href="/interactions" className="text-sm text-slate-500 hover:text-slate-700">
            View all →
          </Link>
        </header>
        <div className="divide-y divide-slate-100">
          {((recentInteractions.data as Interaction[] | null) ?? []).length === 0 && (
            <div className="px-5 py-8 text-sm text-slate-500 text-center">
              No activity yet.{' '}
              <Link href="/interactions/new" className="underline">
                Log your first interaction
              </Link>
              .
            </div>
          )}
          {((recentInteractions.data as Interaction[] | null) ?? []).map((it) => (
            <div key={it.id} className="px-5 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{it.type}</span>
                <span className="text-xs text-slate-500">
                  {new Date(it.occurred_at).toLocaleString()}
                </span>
              </div>
              {it.subject && (
                <div className="text-slate-700 mt-0.5">{it.subject}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string
  value: number | string
  href: string
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 transition-colors block"
    >
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </Link>
  )
}
