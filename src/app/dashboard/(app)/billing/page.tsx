import { createClient } from '@/lib/supabase/server'
import { UpgradeButton } from './UpgradeButton'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, events_used, events_reset_at')
    .eq('id', user.id)
    .single()

  const currentPlan = (profile?.plan as string) ?? 'free'
  const eventsUsed = profile?.events_used ?? 0
  const eventsResetAt = profile?.events_reset_at
    ? new Date(profile.events_reset_at).toLocaleDateString()
    : null

  const freeLimit = 500
  const usagePct = currentPlan === 'free' ? Math.min(100, (eventsUsed / freeLimit) * 100) : 0
  const usageWarn = usagePct >= 80

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-2">Billing</h1>
      <p className="text-zinc-400 text-sm mb-6">Manage your plan and billing.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Current plan</p>
          <p className="text-2xl font-semibold text-white capitalize">{currentPlan}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Events used</p>
          <p className="text-2xl font-semibold text-white">
            {currentPlan === 'free' ? `${eventsUsed} / ${freeLimit}` : eventsUsed}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Events reset at</p>
          <p className="text-2xl font-semibold text-white">
            {eventsResetAt ?? '—'}
          </p>
        </div>
      </div>

      {currentPlan === 'free' && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Usage this period</span>
            <span className={usageWarn ? 'text-amber-400' : 'text-zinc-300'}>
              {eventsUsed} / {freeLimit} ({Math.round(usagePct)}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usageWarn ? 'bg-amber-500' : 'bg-zinc-600'
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {usageWarn && (
            <p className="text-amber-400 text-sm mt-1">
              You&apos;ve used over 80% of your monthly events.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Free</h2>
            {currentPlan === 'free' && (
              <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-700 text-zinc-200">
                Current Plan
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white mb-1">$0<span className="text-base font-normal text-zinc-400">/month</span></p>
          <p className="text-sm text-zinc-400 mb-4">500 events/month</p>
          <ul className="space-y-2 text-sm text-zinc-300 mb-6 flex-1">
            <li>Meta CAPI ✓</li>
            <li>Google Enhanced ✓</li>
            <li className="text-zinc-500">Deduplication ✗</li>
            <li className="text-zinc-500">Webhooks ✗</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-xl bg-zinc-900 border-2 border-emerald-500 p-6 flex flex-col relative">
          <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500 text-emerald-950">
            Recommended
          </div>
          <h2 className="text-lg font-semibold text-white mb-4 mt-1">Pro</h2>
          <p className="text-2xl font-bold text-white mb-1">$29<span className="text-base font-normal text-zinc-400">/month</span></p>
          <p className="text-sm text-zinc-400 mb-4">Unlimited events</p>
          <ul className="space-y-2 text-sm text-zinc-300 mb-6 flex-1">
            <li>Meta CAPI ✓</li>
            <li>Google Enhanced ✓</li>
            <li>Deduplication ✓</li>
            <li>Webhooks ✓</li>
            <li>Event Debugger ✓</li>
          </ul>
          <UpgradeButton />
        </div>

        {/* Agency */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4">Agency</h2>
          <p className="text-2xl font-bold text-white mb-1">$99<span className="text-base font-normal text-zinc-400">/month</span></p>
          <p className="text-sm text-zinc-400 mb-4">Everything in Pro</p>
          <ul className="space-y-2 text-sm text-zinc-300 mb-6 flex-1">
            <li>Up to 10 clients</li>
            <li>White-label reports</li>
            <li>Priority support</li>
          </ul>
          <a
            href="mailto:hassan@itshassanahmed.com"
            className="block w-full py-2.5 rounded-lg font-medium text-center border border-zinc-600 text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Contact Hassan
          </a>
        </div>
      </div>
    </div>
  )
}
