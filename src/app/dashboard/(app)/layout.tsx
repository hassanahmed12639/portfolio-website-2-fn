import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const nav = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Attribution', href: '/dashboard/attribution' },
    { label: 'Cookie Extender', href: '/dashboard/cookie-extender' },
    { label: 'Reverse Proxy', href: '/dashboard/reverse-proxy' },
    { label: 'Enrichment', href: '/dashboard/enrichment' },
    { label: 'Playground', href: '/dashboard/playground' },
    { label: 'Scanner', href: '/dashboard/scanner' },
    { label: 'Event Replay', href: '/dashboard/event-replay' },
    { label: 'Logs', href: '/dashboard/logs' },
    { label: 'AI Analysis', href: '/dashboard/ai-analysis' },
    { label: 'Anomalies', href: '/dashboard/anomalies' },
    { label: 'Integrations', href: '/dashboard/integrations' },
    { label: 'Setup & Snippet', href: '/dashboard/setup' },
    { label: 'Billing', href: '/dashboard/billing' },
  ]

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/50">
        <div className="p-4 border-b border-zinc-800">
          <Link href="/dashboard" className="font-semibold text-white">
            TrackHive
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm"
            >
              {label}
            </Link>
          ))}
          <a
            href="/dashboard/logout"
            className="block px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm"
          >
            Logout
          </a>
        </nav>
        <div className="p-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 truncate px-2" title={user.email ?? ''}>
            {user.email ?? 'Signed in'}
          </p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
