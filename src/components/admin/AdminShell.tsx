'use client'

import Link from 'next/link'
import { AdminNavItem } from './AdminNavItem'

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — fixed, full height */}
      <aside className="w-52 bg-white border-r border-slate-100 fixed left-0 top-0 h-screen flex flex-col z-40 shadow-sm">
        {/* Logo */}
        <div className="px-5 h-14 flex items-center border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-icon.png" alt="TrackHive" className="w-14 h-14 rounded-lg object-contain" />
              <span className="font-bold text-slate-900 text-sm">TrackHive</span>
            </div>
            <span className="text-xs font-semibold text-red-500 ml-9">Admin Panel</span>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <AdminNavItem href="/admin/overview" label="Overview" />
          <AdminNavItem href="/admin/users" label="Users" />
          <AdminNavItem href="/admin/revenue" label="Revenue" />
          <AdminNavItem href="/admin/events" label="Events" />
          <AdminNavItem href="/admin/blog" label="Blog Posts" />
          <AdminNavItem href="/admin/pseo" label="pSEO Pages" />
          <AdminNavItem href="/admin/system" label="System Health" />
        </nav>
        {/* Logout */}
        <div className="px-4 py-3 border-t border-slate-100">
          <Link
            href="/admin/logout"
            className="text-xs text-slate-500 hover:text-red-500 transition-colors"
          >
            Sign out
          </Link>
        </div>
      </aside>
      {/* Main content — offset by sidebar width */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 pl-12 sticky top-0 z-30">
          <p className="text-sm font-semibold text-slate-900">Admin Dashboard</p>
          <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-full font-semibold">
            🔒 Internal Only
          </span>
        </header>
        <main className="admin-main flex-1 p-6 pl-12">
          {children}
        </main>
      </div>
    </div>
  )
}
