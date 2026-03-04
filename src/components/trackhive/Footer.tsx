import Link from "next/link"

export default function TrackHiveFooter() {
  return (
    <footer className="py-16" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & contact - Clause style */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#3b82f6" }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
              </div>
              <span className="font-bold text-white">TrackHive</span>
            </div>
            <p className="text-sm flex items-center gap-2 mb-1" style={{ color: "#94a3b8" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              hello@trackhive.io
            </p>
            <p className="text-sm flex items-center gap-2" style={{ color: "#94a3b8" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Contact us
            </p>
          </div>
          {/* Solution */}
          <div>
            <p className="font-semibold text-white mb-4">Solution</p>
            <div className="space-y-2">
              <Link href="/trackhive#features" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Why TrackHive</Link>
              <Link href="/features" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Features</Link>
              <Link href="/integrations" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Integrations</Link>
              <Link href="/docs" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Documentation</Link>
            </div>
          </div>
          {/* Customers */}
          <div>
            <p className="font-semibold text-white mb-4">Customers</p>
            <div className="space-y-2">
              <Link href="/pricing" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Pricing</Link>
              <Link href="/dashboard/signup" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Start for Free</Link>
              <Link href="/dashboard/login" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Log In</Link>
            </div>
          </div>
          {/* Resources */}
          <div>
            <p className="font-semibold text-white mb-4">Resources</p>
            <div className="space-y-2">
              <Link href="/pricing" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Pricing</Link>
              <a href="#" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Contact Sales</a>
              <Link href="/docs" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Docs</Link>
              <a href="#" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>Blog</a>
            </div>
          </div>
        </div>
        <div className="border-t pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ borderColor: "#334155" }}>
          <p className="text-sm" style={{ color: "#64748b" }}>
            © Copyright 2024 TrackHive. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="#" className="text-white hover:opacity-80 transition-opacity" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
