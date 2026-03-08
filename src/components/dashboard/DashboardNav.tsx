'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart2,
  Bug,
  ChevronDown,
  ChevronRight,
  Cookie,
  Copy,
  Database,
  FileCode,
  Gauge,
  Link2,
  Lock,
  PanelTop,
  PlaySquare,
  Radio,
  RefreshCw,
  RotateCcw,
  ScanSearch,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Workflow,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = { label: string; href: string; icon?: LucideIcon }

// Global nav: ALL users see ALL items (only overview page content changes by dashboard_type)
const nav: NavItem[] = [
  // GENERAL
  { label: 'Overview', href: '/dashboard', icon: Gauge },
  { label: 'Setup', href: '/dashboard/setup', icon: Wrench },
  { label: 'Lead Manager', href: '/dashboard/leads', icon: User },
  { label: 'Event Logs', href: '/dashboard/logs', icon: Activity },
  { label: 'Live Stream', href: '/dashboard/live', icon: Radio },
  { label: 'Event Replay', href: '/dashboard/event-replay', icon: RotateCcw },
  { label: 'Raw Data', href: '/dashboard/raw-data', icon: Database },
  { label: 'Pixels', href: '/dashboard/pixels', icon: Link2 },
  { label: 'Playground', href: '/dashboard/playground', icon: PlaySquare },
  { label: 'Templates', href: '/dashboard/templates', icon: FileCode },
  // TOOLS
  { label: 'Data Quality', href: '/dashboard/data-quality', icon: Shield },
  { label: 'Validator', href: '/dashboard/validator', icon: ShieldCheck },
  { label: 'Deduplication', href: '/dashboard/deduplication', icon: Copy },
  { label: 'Retry Queue', href: '/dashboard/retry-queue', icon: RefreshCw },
  { label: 'HTTP Headers', href: '/dashboard/headers', icon: PanelTop },
  { label: 'Cookie Lifetime Extender', href: '/dashboard/cookie-extender', icon: Cookie },
  { label: 'Anomaly Detection', href: '/dashboard/anomalies', icon: Bug },
  { label: 'Scanner', href: '/dashboard/scanner', icon: ScanSearch },
  { label: 'Enrichment', href: '/dashboard/enrichment', icon: Sparkles },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Settings2 },
  { label: 'Reverse Proxy', href: '/dashboard/reverse-proxy', icon: Workflow },
  { label: 'Attribution', href: '/dashboard/attribution', icon: BarChart2 },
  { label: 'Privacy', href: '/dashboard/privacy', icon: Lock },
]

const iconByHref: Record<string, LucideIcon> = {
  '/dashboard': Gauge,
  '/dashboard/setup': Wrench,
  '/dashboard/leads': User,
  '/dashboard/logs': Activity,
  '/dashboard/live': Radio,
  '/dashboard/event-replay': RotateCcw,
  '/dashboard/raw-data': Database,
  '/dashboard/pixels': Link2,
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
  '/dashboard/enrichment': Sparkles,
  '/dashboard/integrations': Settings2,
  '/dashboard/reverse-proxy': Workflow,
  '/dashboard/attribution': BarChart2,
  '/dashboard/privacy': Lock,
}

const sections = [
  { title: 'General', from: 0, to: 10 },
  { title: 'Tools', from: 10, to: nav.length },
]

export default function DashboardNav({ profile: _profile }: { profile?: { dashboard_type?: string | null } }) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    General: true,
    Tools: true,
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const items = nav.map(({ label, href, icon }) => ({
    label,
    href,
    icon: icon ?? iconByHref[href],
  }))

  return (
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
                className="mb-2 flex w-full items-center gap-2 px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"
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
                  {/* Vertical connector line */}
                  <div
                    className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--dash-border)]"
                    aria-hidden
                  />
                  {sectionItems.map(({ label, href, icon: Icon }) => {
                    const isActive =
                      pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
                    return (
                      <Link
                        key={href}
                        href={href}
                        prefetch={false}
                        className={`relative flex items-center gap-3 rounded-lg pl-4 pr-2 py-2 text-sm transition-colors ${
                          isActive
                            ? 'font-semibold text-[var(--dash-primary-strong)]'
                            : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
                        }`}
                        style={isActive ? { background: 'var(--dash-gradient-sidebar-active)' } : undefined}
                      >
                        {Icon && (
                          <Icon
                            className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--dash-primary-strong)]' : 'text-[var(--dash-muted)]'}`}
                          />
                        )}
                        <span className="flex-1 truncate">{label}</span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[var(--dash-primary-strong)]' : 'text-[var(--dash-muted)]'}`}
                        />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
