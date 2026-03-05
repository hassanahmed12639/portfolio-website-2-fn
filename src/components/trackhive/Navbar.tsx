"use client"

import Link from "next/link"
import { useState } from "react"

export default function TrackHiveNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: "/trackhive", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/integrations", label: "Integrations" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/docs", label: "Docs" },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-[67px] flex items-center justify-between">
        {/* Logo - left */}
        <Link href="/trackhive" className="flex items-center gap-2 shrink-0">
          <img src="/logo-icon.png" alt="TrackHive" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-semibold text-[#1e293b] text-base">
            TrackHive
          </span>
        </Link>

        {/* Nav links - center */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-slate-700 hover:text-slate-900 transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Sign in + CTA */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href="/dashboard/login"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard/signup"
            className="text-sm font-medium px-4 py-2.5 rounded-lg bg-[#1e293b] text-white hover:bg-[#334155] transition-colors shadow-sm"
          >
            Start for free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 -mr-2 text-slate-800"
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
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 py-4 px-6">
          <div className="flex flex-col gap-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-600 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/dashboard/login" className="text-sm text-slate-600 py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/dashboard/signup" className="text-sm font-medium px-4 py-2.5 rounded-lg bg-[#1e293b] text-white" onClick={() => setMobileOpen(false)}>Start for free</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
