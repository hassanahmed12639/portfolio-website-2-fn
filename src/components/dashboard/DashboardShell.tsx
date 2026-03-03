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
        className={`shrink-0 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60'
        }`}
      >
        <div className="flex items-center justify-between p-4 min-w-[240px]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 truncate"
          >
            <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">T</span>
            TrackHive
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
            className="rounded-md border border-slate-200 bg-slate-50 p-1 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        </div>
        <DashboardNav />
        <div className="flex items-center gap-2 px-3 pt-1 pb-3 min-w-[240px]">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5"
            title={user.email ?? ''}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-slate-900">
                {user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'}
              </p>
              <p className="truncate text-[10px] text-slate-500">
                {user.email ?? 'Signed in'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          </div>
        </div>
      </aside>

      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand sidebar"
          className="fixed left-0 top-4 z-50 rounded-r-md border border-l-0 border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 transition-colors shadow-sm"
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
