import { createClient } from '@/lib/supabase/server'
import {
  PLANS,
  getEffectivePlan,
  getEventsLimit,
  isUnlimited,
  type PlanName,
} from '@/lib/plans'
import { StartTrialButton } from './StartTrialButton'
import { UpgradeProButton } from './UpgradeProButton'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'plan, is_trial, trial_expires_at, trial_started_at, events_used, events_reset_at, monthly_scans, monthly_ai_analyses'
    )
    .eq('id', user.id)
    .single()

  const effectivePlan = getEffectivePlan(profile ?? {})
  const planKey = effectivePlan as PlanName
  const eventsLimit = getEventsLimit(planKey)
  const eventsUsed = profile?.events_used ?? 0
  const scansUsed = profile?.monthly_scans ?? 0
  const aiUsed = profile?.monthly_ai_analyses ?? 0
  const scansLimit = PLANS[planKey]?.scans_limit ?? 3
  const aiLimit = PLANS[planKey]?.ai_analyses_limit ?? 3

  const isOnTrial =
    profile?.is_trial &&
    profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) > new Date()
  const trialExpiresAt = profile?.trial_expires_at
    ? new Date(profile.trial_expires_at)
    : null
  const trialDaysLeft =
    trialExpiresAt && isOnTrial
      ? Math.max(0, Math.ceil((trialExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0
  const neverStartedTrial = !profile?.trial_started_at && (profile?.plan === 'free' || !profile?.plan)
  const currentPlanLabel = profile?.plan ?? 'free'

  const usagePct =
    !isUnlimited(eventsLimit) && eventsLimit > 0
      ? Math.min(100, (eventsUsed / eventsLimit) * 100)
      : 0
  const usageWarn = usagePct >= 80

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Billing</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-6">
        Manage your plan, usage, and billing.
      </p>

      {/* Trial banner: free user who never started trial */}
      {neverStartedTrial && (
        <div className="mb-6 rounded-xl bg-[var(--dash-success-soft)] border border-[var(--dash-success-border)] p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium text-[var(--dash-text)]">
              🎉 Try TrackHive Pro FREE for 7 days — No credit card required
            </p>
            <p className="text-sm text-[var(--dash-muted)] mt-0.5">
              Full Pro access: 50k events, all platforms, all features.
            </p>
          </div>
          <StartTrialButton className="shrink-0 px-4 py-2 rounded-lg font-medium bg-[var(--dash-success)] text-white hover:bg-[var(--dash-success-strong)] transition-colors">
            Start Free Trial
          </StartTrialButton>
        </div>
      )}

      {/* Trial countdown: currently on trial */}
      {isOnTrial && (
        <div className="mb-6 rounded-xl bg-[var(--dash-warning)]/20 border border-amber-500/50 p-4 flex flex-wrap items-center justify-between gap-4">
          <p className="font-medium text-[var(--dash-text)]">
            ⏳ Your free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} — Upgrade to keep access
          </p>
          <Link
            href="/dashboard/billing"
            className="shrink-0 px-4 py-2 rounded-lg font-medium bg-[var(--dash-warning)] text-amber-950 hover:bg-amber-400 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Current usage */}
      <div className="mb-8 space-y-4">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] uppercase tracking-wider">
          Current usage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Events this period</p>
            <p className="text-2xl font-semibold text-[var(--dash-text)]">
              {isUnlimited(eventsLimit)
                ? eventsUsed.toLocaleString()
                : `${eventsUsed} / ${eventsLimit}`}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Scans used</p>
            <p className="text-2xl font-semibold text-[var(--dash-text)]">
              {isUnlimited(scansLimit)
                ? scansUsed
                : `${scansUsed} / ${scansLimit}`}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
            <p className="text-sm text-[var(--dash-muted)] mb-1">AI analyses used</p>
            <p className="text-2xl font-semibold text-[var(--dash-text)]">
              {isUnlimited(aiLimit) ? aiUsed : `${aiUsed} / ${aiLimit}`}
            </p>
          </div>
        </div>
        {!isUnlimited(eventsLimit) && eventsLimit > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--dash-muted)]">Events progress</span>
              <span
                className={
                  usageWarn ? 'text-amber-400' : 'text-[var(--dash-muted)]'
                }
              >
                {eventsUsed} / {eventsLimit} ({Math.round(usagePct)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--dash-surface-hover)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usageWarn ? 'bg-[var(--dash-warning)]' : 'bg-[var(--dash-surface-hover)]'
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--dash-surface-hover)] text-[var(--dash-text)] capitalize">
            {currentPlanLabel}
            {isOnTrial && trialExpiresAt && (
              <span className="ml-1 text-[var(--dash-muted)]">
                · Expires {trialExpiresAt.toLocaleDateString()}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* FREE */}
        <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">Free</h2>
            {currentPlanLabel === 'free' && !profile?.trial_started_at && (
              <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--dash-surface-hover)] text-[var(--dash-text)]">
                Current Plan
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-[var(--dash-text)] mb-1">
            $0<span className="text-base font-normal text-[var(--dash-muted)]">/mo</span>
          </p>
          <p className="text-sm text-[var(--dash-muted)] mb-4">500 events/month</p>
          <ul className="space-y-2 text-sm text-[var(--dash-muted)] mb-6 flex-1">
            <li>1 domain</li>
            <li>Meta CAPI ✅</li>
            <li>Google Enhanced ✅</li>
            <li>AI Analysis: 3/month</li>
            <li>Scanner: 3/month</li>
            <li className="text-[var(--dash-muted)]">TikTok / Snapchat / GA4 ❌</li>
            <li className="text-[var(--dash-muted)]">Advanced features ❌</li>
          </ul>
        </div>

        {/* TRIAL — only if never used trial */}
        {neverStartedTrial && (
          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-success-border)] p-6 flex flex-col">
            <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--dash-success-soft)] text-[var(--dash-success)] w-fit mb-4">
              7 Days Free
            </span>
            <h2 className="text-lg font-semibold text-[var(--dash-text)] mb-4">Trial</h2>
            <p className="text-sm text-[var(--dash-muted)] mb-4">
              Full Pro access. No credit card needed.
            </p>
            <ul className="space-y-2 text-sm text-[var(--dash-muted)] mb-6 flex-1">
              <li>50,000 events</li>
              <li>3 domains</li>
              <li>All 5 platforms ✅</li>
              <li>All features ✅</li>
            </ul>
            <StartTrialButton className="w-full py-2.5 rounded-lg font-medium bg-[var(--dash-success)] text-white hover:bg-[var(--dash-success-strong)] transition-colors">
              Start Free Trial
            </StartTrialButton>
          </div>
        )}

        {/* PRO */}
        <div className="rounded-xl bg-[var(--dash-surface)] border-2 border-[var(--dash-success)] p-6 flex flex-col relative">
          <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success)] text-white">
            Most Popular
          </div>
          <h2 className="text-lg font-semibold text-[var(--dash-text)] mb-4 mt-1">Pro</h2>
          <p className="text-2xl font-bold text-[var(--dash-text)] mb-1">
            $10<span className="text-base font-normal text-[var(--dash-muted)]">/mo</span>
          </p>
          <p className="text-sm text-[var(--dash-muted)] mb-4">50,000 events/month</p>
          <ul className="space-y-2 text-sm text-[var(--dash-muted)] mb-6 flex-1">
            <li>3 domains</li>
            <li>All 5 platforms ✅</li>
            <li>All features ✅</li>
            <li className="text-[var(--dash-muted)]">GTM Templates ❌</li>
          </ul>
          <UpgradeProButton />
        </div>

        {/* AGENCY */}
        <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-[var(--dash-text)] mb-4">Agency</h2>
          <p className="text-2xl font-bold text-[var(--dash-text)] mb-1">
            $25<span className="text-base font-normal text-[var(--dash-muted)]">/mo</span>
          </p>
          <p className="text-sm text-[var(--dash-muted)] mb-4">Unlimited events</p>
          <ul className="space-y-2 text-sm text-[var(--dash-muted)] mb-6 flex-1">
            <li>10 domains</li>
            <li>Everything in Pro ✅</li>
            <li>GTM Templates ✅ (80+ templates)</li>
            <li>White-label ✅</li>
            <li>Priority support ✅</li>
          </ul>
          <a
            href="mailto:hassan@itshassanahmed.com"
            className="block w-full py-2.5 rounded-lg font-medium text-center border border-[var(--dash-border-strong)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors"
          >
            Contact Hassan
          </a>
        </div>
      </div>

      {/* Feature comparison table */}
      <h2 className="text-sm font-medium text-[var(--dash-muted)] uppercase tracking-wider mb-4">
        Feature comparison
      </h2>
      <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--dash-border)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--dash-muted)]">
                Feature
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--dash-muted)]">
                Free
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--dash-muted)]">
                Pro
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--dash-muted)]">
                Agency
              </th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['meta_capi', 'Meta CAPI'],
                ['google_enhanced', 'Google Enhanced'],
                ['tiktok', 'TikTok'],
                ['snapchat', 'Snapchat'],
                ['ga4', 'GA4'],
                ['cookie_extender', 'Cookie Extender'],
                ['reverse_proxy', 'Reverse Proxy'],
                ['enrichment', 'Enrichment'],
                ['anomaly_detection', 'Anomaly Detection'],
                ['event_replay', 'Event Replay'],
                ['raw_data_export', 'Raw Data Export'],
                ['attribution', 'Attribution'],
                ['ai_analysis', 'AI Analysis'],
                ['website_scanner', 'Website Scanner'],
                ['http_headers', 'HTTP Headers'],
                ['privacy_config', 'Privacy Config'],
                ['playground', 'Playground'],
                ['gtm_templates', 'GTM Templates'],
              ] as const
            ).map(([key, label]) => (
              <tr key={key} className="border-b border-[var(--dash-border)]/80">
                <td className="px-4 py-3 text-[var(--dash-muted)]">{label}</td>
                <td className="px-4 py-3">
                  {PLANS.free.features[key] ? (
                    <span className="text-[var(--dash-success)]">✓</span>
                  ) : (
                    <span className="text-[var(--dash-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {PLANS.pro.features[key] ? (
                    <span className="text-[var(--dash-success)]">✓</span>
                  ) : (
                    <span className="text-[var(--dash-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {PLANS.agency.features[key] ? (
                    <span className="text-[var(--dash-success)]">✓</span>
                  ) : (
                    <span className="text-[var(--dash-muted)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}




