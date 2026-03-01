import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Shield } from 'lucide-react'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at')
    .eq('id', user.id)
    .single()

  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  const nav = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Templates', href: '/dashboard/templates' },
    { label: 'Privacy', href: '/dashboard/privacy' },
    { label: 'Headers', href: '/dashboard/headers' },
    { label: 'Attribution', href: '/dashboard/attribution' },
    { label: 'Cookie Extender', href: '/dashboard/cookie-extender' },
    { label: 'Reverse Proxy', href: '/dashboard/reverse-proxy' },
    { label: 'Enrichment', href: '/dashboard/enrichment' },
    { label: 'Playground', href: '/dashboard/playground' },
    { label: 'Scanner', href: '/dashboard/scanner' },
    { label: 'Event Replay', href: '/dashboard/event-replay' },
    { label: 'Logs', href: '/dashboard/logs' },
    { label: 'Data Quality', href: '/dashboard/data-quality', icon: Shield },
    { label: 'AI Analysis', href: '/dashboard/ai-analysis' },
    { label: 'Anomalies', href: '/dashboard/anomalies' },
    { label: 'Integrations', href: '/dashboard/integrations' },
    { label: 'Raw Data', href: '/dashboard/raw-data' },
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
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm"
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
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
      <main className="flex-1 overflow-auto flex flex-col">
        {trialExpired && (
          <div className="shrink-0 rounded-none bg-red-500/20 border-b border-red-500/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-white">
              Your trial has expired. Upgrade to Pro for $10/mo to keep access.
            </p>
            <Link
              href="/dashboard/billing"
              className="shrink-0 px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
