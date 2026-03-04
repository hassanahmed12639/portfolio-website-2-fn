'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Bell,
  Brain,
  Bug,
  ChevronDown,
  ChevronRight,
  Copy,
  Gauge,
  Link2,
  PlaySquare,
  Radio,
  RefreshCw,
  SearchCheck,
  Settings2,
  Shield,
  ShieldCheck,
  User,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = { label: string; href: string; icon?: LucideIcon }

// Global nav: ALL users see ALL items (only overview page content changes by dashboard_type)
const nav: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: Gauge },
  { label: 'Lead Manager', href: '/dashboard/leads', icon: User },
  { label: 'Event Logs', href: '/dashboard/logs', icon: Activity },
  { label: 'Live Stream', href: '/dashboard/live', icon: Radio },
  { label: 'Pixels', href: '/dashboard/pixels', icon: Link2 },
  { label: 'Playground', href: '/dashboard/playground', icon: PlaySquare },
  { label: 'Data Quality', href: '/dashboard/data-quality', icon: Shield },
  { label: 'Validator', href: '/dashboard/validator', icon: ShieldCheck },
  { label: 'Deduplication', href: '/dashboard/deduplication', icon: Copy },
  { label: 'Retry Queue', href: '/dashboard/retry-queue', icon: RefreshCw },
  { label: 'AI Analysis', href: '/dashboard/ai-analysis', icon: Brain },
  { label: 'Anomaly Detection', href: '/dashboard/anomalies', icon: Bug },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Settings2 },
  { label: 'Reverse Proxy', href: '/dashboard/reverse-proxy', icon: Workflow },
  { label: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { label: 'Billing', href: '/dashboard/billing', icon: SearchCheck },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings2 },
]

const iconByHref: Record<string, LucideIcon> = {
  '/dashboard': Gauge,
  '/dashboard/leads': User,
  '/dashboard/logs': Activity,
  '/dashboard/live': Radio,
  '/dashboard/pixels': Link2,
  '/dashboard/playground': PlaySquare,
  '/dashboard/data-quality': Shield,
  '/dashboard/validator': ShieldCheck,
  '/dashboard/deduplication': Copy,
  '/dashboard/retry-queue': RefreshCw,
  '/dashboard/ai-analysis': Brain,
  '/dashboard/anomalies': Bug,
  '/dashboard/integrations': Settings2,
  '/dashboard/reverse-proxy': Workflow,
  '/dashboard/alerts': Bell,
  '/dashboard/billing': SearchCheck,
  '/dashboard/settings': Settings2,
}

const sections = [
  { title: 'GENERAL', from: 0, to: 6 },
  { title: 'TOOLS', from: 6, to: 15 },
  { title: 'SUPPORT', from: 15, to: nav.length + 1 },
]

export default function DashboardNav({ profile: _profile }: { profile?: { dashboard_type?: string | null } }) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    GENERAL: true,
    TOOLS: true,
    SUPPORT: true,
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const items = [
    ...nav.map(({ label, href, icon }) => ({
      label,
      href,
      icon: icon ?? iconByHref[href],
      isLogout: false,
    })),
    { label: 'Logout', href: '/dashboard/logout', icon: SearchCheck, isLogout: true },
  ]

  return (
    <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-1">
      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSections[section.title]
          const sectionItems = items.slice(section.from, section.to)
          return (
            <div key={section.title}>
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="mb-1.5 flex w-full items-center gap-1.5 px-2 py-0.5 text-left text-sm font-bold tracking-wide text-slate-700 transition-colors hover:text-slate-900"
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                <span>{section.title}</span>
              </button>
              {isOpen && (
                <div className="space-y-0.5">
                  {sectionItems.map(({ label, href, icon: Icon, isLogout }) => {
                    const isActive =
                      !isLogout &&
                      (pathname === href ||
                        (href !== '/dashboard' && pathname.startsWith(href + '/')))
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-[var(--dash-primary-soft)] font-semibold text-[var(--dash-primary)]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[var(--dash-primary)]' : 'text-slate-700'}`} />}
                        <span className="truncate">{label}</span>
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
