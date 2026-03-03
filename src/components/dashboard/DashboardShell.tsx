'use client'

import Link from 'next/link'
import { useState } from 'react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { Bell, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

type DashboardShellProps = {
  user: User
  trialExpired: boolean
  children: React.ReactNode
}

export default function DashboardShell({ user, trialExpired, children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="dashboard-shell min-h-screen flex bg-[var(--dash-bg)] text-[var(--dash-text)]">
      <aside
        className={`shrink-0 flex flex-col border-r border-[#e4e4e7] bg-[#f5f5f6] transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60'
        }`}
      >
        <div className="flex items-center justify-between p-4 min-w-[240px]">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[var(--dash-success)] truncate"
          >
            TrackHive
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
            className="rounded-md border border-[#e4e4e7] bg-[#fafafa] p-1 text-[#a1a1aa] hover:bg-[#e4e4e7] transition-colors shrink-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        </div>
        <DashboardNav />
        <div className="flex items-center gap-2 px-3 pt-1 pb-3 min-w-[240px]">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[#52525b] transition-colors hover:bg-[#fafafa]"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5"
            title={user.email ?? ''}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9d5ff] text-sm font-semibold text-[#6b21a8]">
              {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-[#27272a]">
                {user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'}
              </p>
              <p className="truncate text-[10px] text-[#71717a]">
                {user.email ?? 'Signed in'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#52525b]" />
          </div>
        </div>
      </aside>

      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand sidebar"
          className="fixed left-0 top-4 z-50 rounded-r-md border border-l-0 border-[#e4e4e7] bg-[#fafafa] p-2 text-[#a1a1aa] hover:bg-[#e4e4e7] transition-colors shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <main className="flex-1 overflow-auto flex flex-col bg-[var(--dash-bg)] min-w-0">
        {trialExpired && (
          <div className="shrink-0 rounded-none bg-[var(--dash-danger-soft)] border-b border-[var(--dash-danger-border)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-[var(--dash-danger-strong)]">
              Your trial has expired. Upgrade to Pro for $10/mo to keep access.
            </p>
            <Link
              href="/dashboard/billing"
              className="shrink-0 px-4 py-2 rounded-lg font-medium bg-[var(--dash-danger)] text-white hover:bg-[var(--dash-danger-strong)] transition-colors"
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
