'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart2,
  Braces,
  Bug,
  ChevronDown,
  ChevronRight,
  Cookie,
  Copy,
  Database,
  FileCode,
  Gauge,
  LayoutDashboard,
  Link2,
  Lock,
  PanelTop,
  PlaySquare,
  Plug,
  Radio,
  RefreshCw,
  RotateCcw,
  ScanSearch,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Webhook,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'
import { UpgradeModal } from '@/components/UpgradeModal'
import type { FeatureKey } from '@/lib/plans'
import { resolveDashboardMode } from '@/lib/dashboard-mode'

type NavItem = {
  label: string
  href: string
  icon?: LucideIcon
  locked?: boolean
  requiredPlan?: 'pro' | 'agency'
  feature?: FeatureKey
}

export default function DashboardNav({
  profile,
  collapsed = false,
}: {
  profile?: { dashboard_type?: string | null; business_type?: string | null }
  collapsed?: boolean
}) {
  const pathname = usePathname()
  const { can, plan } = usePlan()
  const [query, setQuery] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState<{
    show: boolean
    feature: string
    plan: 'pro' | 'agency'
  }>({ show: false, feature: '', plan: 'pro' })

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    General: true,
    Tools: true,
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  // Close upgrade modal when user navigates to billing page
  useEffect(() => {
    if (pathname?.includes('/dashboard/billing')) {
      setShowUpgradeModal((s) => ({ ...s, show: false }))
    }
  }, [pathname])

  const nav: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: Gauge },
    { label: 'Setup', href: '/dashboard/setup', icon: Wrench },
    {
      label: 'Lead Manager',
      href: '/dashboard/leads',
      icon: Users,
      locked: !can('lead_manager'),
      requiredPlan: 'pro',
      feature: 'lead_manager',
    },
    { label: 'Event Logs', href: '/dashboard/logs', icon: Activity },
    {
      label: 'Live Stream',
      href: '/dashboard/live',
      icon: Radio,
      locked: !can('live_stream'),
      requiredPlan: 'pro',
      feature: 'live_stream',
    },
    {
      label: 'Event Replay',
      href: '/dashboard/event-replay',
      icon: RotateCcw,
      locked: !can('event_replay'),
      requiredPlan: 'pro',
      feature: 'event_replay',
    },
    {
      label: 'Raw Data',
      href: '/dashboard/raw-data',
      icon: Database,
      locked: !can('raw_data'),
      requiredPlan: 'pro',
      feature: 'raw_data',
    },
    { label: 'Pixels', href: '/dashboard/pixels', icon: Link2 },
    { label: 'Pixel Warmup', href: '/dashboard/pixel-warmup', icon: Sparkles },
    { label: 'Webhooks', href: '/dashboard/leadgen/webhooks', icon: Webhook },
    { label: 'Playground', href: '/dashboard/playground', icon: PlaySquare },
    {
      label: 'Templates',
      href: '/dashboard/templates',
      icon: FileCode,
      locked: !can('templates'),
      requiredPlan: 'pro',
      feature: 'templates',
    },
    {
      label: 'Data Quality',
      href: '/dashboard/data-quality',
      icon: Shield,
      locked: !can('data_quality'),
      requiredPlan: 'pro',
      feature: 'data_quality',
    },
    {
      label: 'Conversion Feedback',
      href: '/dashboard/conversion-feedback',
      icon: BarChart2,
      feature: 'conversion_feedback',
    },
    {
      label: 'Deduplication',
      href: '/dashboard/deduplication',
      icon: Copy,
      locked: !can('deduplication'),
      requiredPlan: 'pro',
      feature: 'deduplication',
    },
    {
      label: 'HTTP Headers',
      href: '/dashboard/headers',
      icon: PanelTop,
      locked: !can('http_headers'),
      requiredPlan: 'pro',
      feature: 'http_headers',
    },
    {
      label: 'Cookie Lifetime Extender',
      href: '/dashboard/cookie-extender',
      icon: Cookie,
      locked: !can('cookie_extender'),
      requiredPlan: 'pro',
      feature: 'cookie_extender',
    },
    {
      label: 'Anomaly Detection',
      href: '/dashboard/anomalies',
      icon: Bug,
      locked: !can('anomaly_detection'),
      requiredPlan: 'pro',
      feature: 'anomaly_detection',
    },
    { label: 'Regex Library', href: '/dashboard/regex-library', icon: Braces },
    {
      label: 'Auto-Track',
      href: '/dashboard/auto-track',
      icon: Sparkles,
      locked: !(plan === 'pro' || plan === 'agency'),
      requiredPlan: 'pro',
    },
    {
      label: 'Integrations',
      href: '/dashboard/integrations',
      icon: Settings2,
      locked: !can('integrations'),
      requiredPlan: 'pro',
      feature: 'integrations',
    },
    {
      label: 'Reverse Proxy',
      href: '/dashboard/reverse-proxy',
      icon: Workflow,
      locked: !can('reverse_proxy'),
      requiredPlan: 'pro',
      feature: 'reverse_proxy',
    },
    { label: 'Connectors', href: '/dashboard/connectors', icon: Plug },
    { label: 'Custom Dashboards', href: '/dashboard/custom-dashboards', icon: LayoutDashboard },
    { label: 'Privacy', href: '/dashboard/privacy', icon: Lock },
    ...(plan === 'agency'
      ? [
          {
            label: 'Team Members',
            href: '/dashboard/team',
            icon: Users,
            locked: false,
          },
        ]
      : []),
  ]

  const iconByHref: Record<string, LucideIcon> = {
    '/dashboard': Gauge,
    '/dashboard/setup': Wrench,
    '/dashboard/leads': Users,
    '/dashboard/logs': Activity,
    '/dashboard/live': Radio,
    '/dashboard/event-replay': RotateCcw,
    '/dashboard/raw-data': Database,
    '/dashboard/pixels': Link2,
    '/dashboard/leadgen/webhooks': Webhook,
    '/dashboard/webhooks': Webhook,
    '/dashboard/playground': PlaySquare,
    '/dashboard/templates': FileCode,
    '/dashboard/data-quality': Shield,
    '/dashboard/conversion-feedback': BarChart2,
    '/dashboard/deduplication': Copy,
    '/dashboard/headers': PanelTop,
    '/dashboard/cookie-extender': Cookie,
    '/dashboard/anomalies': Bug,
    '/dashboard/regex-library': Braces,
    '/dashboard/auto-track': Sparkles,
    '/dashboard/integrations': Settings2,
    '/dashboard/reverse-proxy': Workflow,
    '/dashboard/connectors': Plug,
    '/dashboard/custom-dashboards': LayoutDashboard,
    '/dashboard/privacy': Lock,
    '/dashboard/team': Users,
  }

  const items = nav.map(({ label, href, icon, ...rest }) => {
    const resolvedHref =
      label === 'Webhooks'
        ? resolveDashboardMode(profile) === 'leadgen'
          ? '/dashboard/leadgen/webhooks'
          : '/dashboard/webhooks'
        : href
    return {
      label,
      href: resolvedHref,
      icon: icon ?? iconByHref[resolvedHref] ?? iconByHref[href],
      ...rest,
    }
  })

  const sections = [
    { title: 'General', from: 0, to: 10 },
    { title: 'Tools', from: 10, to: nav.length },
  ]

  const handleNavClick = (item: NavItem) => {
    if (item.locked && item.requiredPlan) {
      setShowUpgradeModal({
        show: true,
        feature: item.label,
        plan: item.requiredPlan,
      })
    }
  }

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
        {!collapsed && (
          <div className="sticky top-0 bg-[var(--dash-sidebar)] pb-3 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] pl-9 pr-3 py-2 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] outline-none focus:ring-2 focus:ring-[var(--dash-primary-soft-strong)]"
              />
            </div>
          </div>
        )}

        <div className="space-y-5">
          {sections.map((section) => {
            const isOpen = openSections[section.title]
            const sectionItems = items
              .slice(section.from, section.to)
              .filter((i) =>
                query.trim()
                  ? i.label.toLowerCase().includes(query.trim().toLowerCase())
                  : true
              )

            if (query.trim() && sectionItems.length === 0) return null

            return (
              <div key={section.title}>
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    className="mb-2 flex w-full items-center justify-between gap-2 px-2 py-1 text-left text-sm font-medium text-[var(--dash-text-secondary)] transition-colors hover:text-[var(--dash-text)]"
                  >
                    <span className="truncate">{section.title}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--dash-muted)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--dash-muted)]" />
                    )}
                  </button>
                )}

                {isOpen && (
                  <div className={`space-y-1 ${collapsed ? 'mt-2' : ''}`}>
                    {sectionItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' &&
                          pathname?.startsWith(item.href + '/'))

                      const base = collapsed
                        ? 'flex w-full items-center justify-center rounded-xl p-2 text-sm transition-colors'
                        : 'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors'
                      const active = 'font-semibold text-[var(--dash-primary-strong)]'
                      const inactive = 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'

                      const background = isActive
                        ? { background: 'var(--dash-gradient-sidebar-active)' }
                        : undefined

                      return (
                        <div key={item.href} className="flex">
                          {item.locked ? (
                            <button
                              type="button"
                              onClick={() => handleNavClick(item)}
                              className={`${base} ${isActive ? active : inactive} text-left`}
                              style={background}
                              title={collapsed ? item.label : undefined}
                            >
                              {item.icon && (
                                <item.icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive
                                      ? 'text-[var(--dash-primary-strong)]'
                                      : 'text-[var(--dash-muted)]'
                                  }`}
                                />
                              )}
                              {!collapsed && (
                                <>
                                  <span className="flex-1 truncate">{item.label}</span>
                                  <span className="text-[10px] bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] px-2 py-0.5 rounded-full font-semibold shrink-0 border border-[var(--dash-accent-border)]">
                                    PRO
                                  </span>
                                </>
                              )}
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              prefetch={false}
                              className={`${base} ${isActive ? active : inactive}`}
                              style={background}
                              title={collapsed ? item.label : undefined}
                            >
                              {item.icon && (
                                <item.icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive
                                      ? 'text-[var(--dash-primary-strong)]'
                                      : 'text-[var(--dash-muted)]'
                                  }`}
                                />
                              )}
                              {!collapsed && (
                                <>
                                  <span className="flex-1 truncate">{item.label}</span>
                                </>
                              )}
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

        </div>
      </nav>
      <UpgradeModal
        isOpen={showUpgradeModal.show}
        onClose={() =>
          setShowUpgradeModal((s) => ({ ...s, show: false }))
        }
        feature={showUpgradeModal.feature}
        requiredPlan={showUpgradeModal.plan}
      />
    </>
  )
}
