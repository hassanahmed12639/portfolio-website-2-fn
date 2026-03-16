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
}: {
  profile?: { dashboard_type?: string | null }
}) {
  const pathname = usePathname()
  const { can, plan } = usePlan()
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
      label: 'Validator',
      href: '/dashboard/validator',
      icon: ShieldCheck,
      locked: !can('validator'),
      requiredPlan: 'pro',
      feature: 'validator',
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
      label: 'Retry Queue',
      href: '/dashboard/retry-queue',
      icon: RefreshCw,
      locked: !can('retry_queue'),
      requiredPlan: 'pro',
      feature: 'retry_queue',
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
    { label: 'Scanner', href: '/dashboard/scanner', icon: ScanSearch },
    { label: 'Regex Library', href: '/dashboard/regex-library', icon: Braces },
    {
      label: 'Enrichment',
      href: '/dashboard/enrichment',
      icon: Sparkles,
      locked: !can('enrichment'),
      requiredPlan: 'pro',
      feature: 'enrichment',
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
    {
      label: 'Attribution',
      href: '/dashboard/attribution',
      icon: BarChart2,
      locked: !can('attribution'),
      requiredPlan: 'pro',
      feature: 'attribution',
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
    '/dashboard/validator': ShieldCheck,
    '/dashboard/deduplication': Copy,
    '/dashboard/retry-queue': RefreshCw,
    '/dashboard/headers': PanelTop,
    '/dashboard/cookie-extender': Cookie,
    '/dashboard/anomalies': Bug,
    '/dashboard/scanner': ScanSearch,
    '/dashboard/regex-library': Braces,
    '/dashboard/enrichment': Sparkles,
    '/dashboard/integrations': Settings2,
    '/dashboard/reverse-proxy': Workflow,
    '/dashboard/attribution': BarChart2,
    '/dashboard/connectors': Plug,
    '/dashboard/custom-dashboards': LayoutDashboard,
    '/dashboard/privacy': Lock,
    '/dashboard/team': Users,
  }

  const items = nav.map(({ label, href, icon, ...rest }) => {
    const resolvedHref =
      label === 'Webhooks'
        ? profile?.dashboard_type === 'leadgen'
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
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
        <div className="space-y-5">
          {sections.map((section) => {
            const isOpen = openSections[section.title]
            const sectionItems = items.slice(section.from, section.to)
            return (
              <div key={section.title}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="mb-2 flex w-full items-center gap-2 px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-900"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{section.title}</span>
                </button>
                {isOpen && (
                  <div className="relative space-y-0.5 pl-1">
                    <div
                      className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--dash-border)]"
                      aria-hidden
                    />
                    {sectionItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' &&
                          pathname?.startsWith(item.href + '/'))
                      return (
                        <div key={item.href} className="relative flex items-center">
                          {item.locked ? (
                            <button
                              type="button"
                              onClick={() => handleNavClick(item)}
                              className={`relative flex w-full items-center gap-3 rounded-lg pl-4 pr-2 py-2 text-sm transition-colors text-left ${
                                isActive
                                  ? 'font-semibold text-[var(--dash-primary-strong)]'
                                  : 'text-slate-900 hover:bg-[var(--dash-surface-hover)]'
                              }`}
                              style={
                                isActive
                                  ? {
                                      background:
                                        'var(--dash-gradient-sidebar-active)',
                                    }
                                  : undefined}
                            >
                              {item.icon && (
                                <item.icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive
                                      ? 'text-[var(--dash-primary-strong)]'
                                      : 'text-slate-600'
                                  }`}
                                />
                              )}
                              <span className="flex-1 truncate">{item.label}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                                PRO
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              prefetch={false}
                              className={`relative flex items-center gap-3 rounded-lg pl-4 pr-2 py-2 text-sm transition-colors w-full ${
                                isActive
                                  ? 'font-semibold text-[var(--dash-primary-strong)]'
                                  : 'text-slate-900 hover:bg-[var(--dash-surface-hover)]'
                              }`}
                              style={
                                isActive
                                  ? {
                                      background:
                                        'var(--dash-gradient-sidebar-active)',
                                    }
                                  : undefined}
                            >
                              {item.icon && (
                                <item.icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive
                                      ? 'text-[var(--dash-primary-strong)]'
                                      : 'text-slate-600'
                                  }`}
                                />
                              )}
                              <span className="flex-1 truncate">{item.label}</span>
                              <ChevronRight
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  isActive
                                    ? 'text-[var(--dash-primary-strong)]'
                                    : 'text-slate-500'
                                }`}
                              />
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
