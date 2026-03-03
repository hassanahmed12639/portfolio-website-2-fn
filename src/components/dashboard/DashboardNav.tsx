'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Bell,
  Bot,
  Brain,
  Bug,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  Eye,
  FileCheck2,
  FileText,
  Fingerprint,
  Gauge,
  Link2,
  PlaySquare,
  Radio,
  RefreshCw,
  Scan,
  SearchCheck,
  Settings2,
  Shield,
  ShieldCheck,
  Spline,
  Workflow,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const nav = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Live Stream', href: '/dashboard/live', icon: Radio },
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
  { label: 'Retry Queue', href: '/dashboard/retry-queue', icon: RefreshCw },
  { label: 'Deduplication', href: '/dashboard/deduplication', icon: Copy },
  { label: 'Logs', href: '/dashboard/logs' },
  { label: 'Validator', href: '/dashboard/validator', icon: ShieldCheck },
  { label: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { label: 'Data Quality', href: '/dashboard/data-quality', icon: Shield },
  { label: 'AI Analysis', href: '/dashboard/ai-analysis' },
  { label: 'Anomalies', href: '/dashboard/anomalies' },
  { label: 'Integrations', href: '/dashboard/integrations' },
  { label: 'Multi-Pixel', href: '/dashboard/pixels' },
  { label: 'Raw Data', href: '/dashboard/raw-data' },
  { label: 'Setup & Snippet', href: '/dashboard/setup' },
  { label: 'Billing', href: '/dashboard/billing' },
]

const sections = [
  { title: 'GENERAL', from: 0, to: 8 },
  { title: 'TOOLS', from: 8, to: 18 },
  { title: 'SUPPORT', from: 18, to: nav.length + 1 }, // includes logout
]

const iconByHref: Record<string, LucideIcon> = {
  '/dashboard': Gauge,
  '/dashboard/live': Radio,
  '/dashboard/templates': FileText,
  '/dashboard/privacy': Fingerprint,
  '/dashboard/headers': ShieldCheck,
  '/dashboard/attribution': Spline,
  '/dashboard/cookie-extender': Link2,
  '/dashboard/reverse-proxy': Workflow,
  '/dashboard/enrichment': Bot,
  '/dashboard/playground': PlaySquare,
  '/dashboard/scanner': Scan,
  '/dashboard/event-replay': Eye,
  '/dashboard/retry-queue': RefreshCw,
  '/dashboard/deduplication': Copy,
  '/dashboard/logs': Activity,
  '/dashboard/validator': FileCheck2,
  '/dashboard/alerts': Bell,
  '/dashboard/data-quality': Shield,
  '/dashboard/ai-analysis': Brain,
  '/dashboard/anomalies': Bug,
  '/dashboard/integrations': Settings2,
  '/dashboard/pixels': Link2,
  '/dashboard/raw-data': Database,
  '/dashboard/setup': Wrench,
  '/dashboard/billing': SearchCheck,
}

export default function DashboardNav() {
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
                className="mb-1.5 flex w-full items-center gap-1.5 px-2 py-0.5 text-left text-[10px] font-semibold tracking-wide text-[#a1a1aa] transition-colors hover:text-[#71717a]"
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
                      !isLogout && (pathname === href || pathname.startsWith(href + '/'))
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors ${
                          isActive
                            ? 'bg-[#eceef2] font-semibold text-[#27272a]'
                            : 'text-[#3f3f46] hover:bg-[#eef0f3] hover:text-[#27272a]'
                        }`}
                      >
                        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[#52525b]" />}
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
