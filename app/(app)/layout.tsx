import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  MessageSquare,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', Icon: Users },
  { href: '/companies', label: 'Companies', Icon: Building2 },
  { href: '/pipeline', label: 'Pipeline', Icon: TrendingUp },
  { href: '/interactions', label: 'Activity', Icon: MessageSquare },
]

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-slate-200">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            CRM
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="px-2 py-1 text-xs text-slate-500 truncate" title={user.email ?? ''}>
            {user.email}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
