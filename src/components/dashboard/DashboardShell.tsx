'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { DashboardProvider } from '@/contexts/DashboardContext'
import {
  Bell,
  ChevronDown,
  ChevronRight,
  FileStack,
  LogOut,
  PanelLeftClose,
  CreditCard,
  User,
  Sparkles,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type Profile = { dashboard_type?: string | null } | undefined

type DashboardShellProps = {
  user: SupabaseUser
  trialExpired: boolean
  profile?: Profile
  children: React.ReactNode
}

export default function DashboardShell({ user, trialExpired, profile, children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = () => {
    router.push('/dashboard/logout')
  }

  return (
    <div className="dashboard-shell min-h-screen flex bg-[var(--dash-bg)] text-[var(--dash-text)]">
      <aside
        className={`shrink-0 flex flex-col border-r border-[var(--dash-border)] bg-[var(--dash-sidebar)] transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60'
        }`}
      >
        {/* Org / Workspace header */}
        <div className="flex items-center justify-between gap-2 p-4 min-w-[240px] border-b border-[var(--dash-border)]">
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)]">
              <FileStack className="h-4 w-4 text-[var(--dash-text)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--dash-text)]">TrackHive</p>
              <p className="truncate text-xs text-[var(--dash-muted)]">Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <ChevronDown className="h-4 w-4 text-[var(--dash-muted)]" aria-hidden />
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              aria-label="Collapse sidebar"
              className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)] transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DashboardNav profile={profile} />

        {/* Projects / User section */}
        <div className="mt-auto border-t border-[var(--dash-border)] px-3 py-3 min-w-[240px]">
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">
            Account
          </p>
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--dash-surface-hover)]"
              title={user.email ?? ''}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dash-primary-soft)] text-sm font-semibold text-[var(--dash-primary)]">
                {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-[var(--dash-text)]">
                  {user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'}
                </p>
                <p className="truncate text-xs text-[var(--dash-muted)]">{user.email ?? 'Signed in'}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--dash-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)] py-1.5 z-50">
                <Link
                  href="/dashboard/billing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]"
                >
                  <Sparkles className="h-4 w-4 text-[var(--dash-muted)]" />
                  Upgrade to Pro
                </Link>
                <Link
                  href="/dashboard/account"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]"
                >
                  <User className="h-4 w-4 text-[var(--dash-muted)]" />
                  Account
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]"
                >
                  <CreditCard className="h-4 w-4 text-[var(--dash-muted)]" />
                  Billing
                </Link>
                <Link
                  href="/dashboard/alerts"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]"
                >
                  <Bell className="h-4 w-4 text-[var(--dash-muted)]" />
                  Notifications
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]"
                >
                  <LogOut className="h-4 w-4 text-[var(--dash-muted)]" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand sidebar"
          className="fixed left-0 top-4 z-50 rounded-r-md border border-l-0 border-[var(--dash-border)] bg-[var(--dash-sidebar)] p-2 text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors shadow-sm"
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
          <DashboardProvider dashboardType={(profile?.dashboard_type === 'leadgen' ? 'leadgen' : 'ecommerce') as 'ecommerce' | 'leadgen'}>
            {children}
          </DashboardProvider>
        </div>
      </main>
    </div>
  )
}
