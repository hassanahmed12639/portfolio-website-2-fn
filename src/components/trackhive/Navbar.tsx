"use client"

import Link from "next/link"
import { useState } from "react"

export default function TrackHiveNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50"
      style={{ borderColor: "#e2e8f0" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/trackhive" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#2563eb" }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <span className="font-bold text-lg" style={{ color: "#0f172a" }}>
            TrackHive
          </span>
        </Link>
        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#475569" }}>
            Features
          </Link>
          <Link href="/integrations" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#475569" }}>
            Integrations
          </Link>
          <Link href="/pricing" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#475569" }}>
            Pricing
          </Link>
          <Link href="/docs" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#475569" }}>
            Docs
          </Link>
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard/login"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "#475569" }}
          >
            Sign in
          </Link>
          <Link
            href="/dashboard/signup"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors text-white hover:opacity-90"
            style={{ backgroundColor: "#2563eb" }}
          >
            Start for free
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t py-4 px-6"
          style={{ borderColor: "#e2e8f0", backgroundColor: "rgba(255,255,255,0.98)" }}
        >
          <div className="flex flex-col gap-4">
            <Link href="/features" className="text-sm py-2" style={{ color: "#475569" }} onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="/integrations" className="text-sm py-2" style={{ color: "#475569" }} onClick={() => setMobileOpen(false)}>Integrations</Link>
            <Link href="/pricing" className="text-sm py-2" style={{ color: "#475569" }} onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/docs" className="text-sm py-2" style={{ color: "#475569" }} onClick={() => setMobileOpen(false)}>Docs</Link>
            <div className="flex gap-3 pt-2">
              <Link href="/dashboard/login" className="text-sm py-2" style={{ color: "#475569" }} onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/dashboard/signup" className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#2563eb" }} onClick={() => setMobileOpen(false)}>Start for free</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
