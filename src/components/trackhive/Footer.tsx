import Link from "next/link"

export default function TrackHiveFooter() {
  return (
    <footer className="py-16" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg"
                style={{ backgroundColor: "#2563eb" }}
              />
              <span className="font-bold text-white">TrackHive</span>
            </div>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              The ultimate server-side tracking solution for modern e-commerce brands.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-4">Product</p>
            <div className="space-y-2">
              <Link href="/features" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Features
              </Link>
              <Link href="/integrations" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Integrations
              </Link>
              <Link href="/pricing" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Pricing
              </Link>
              <Link href="/docs" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Documentation
              </Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white mb-4">Company</p>
            <div className="space-y-2">
              <a href="#" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                About Us
              </a>
              <a href="#" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Blog
              </a>
              <a href="#" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Contact
              </a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white mb-4">Legal</p>
            <div className="space-y-2">
              <Link href="/privacy-policy" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Privacy Policy
              </Link>
              <Link href="/tos" className="block text-sm hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t pt-8 text-center" style={{ borderColor: "#334155" }}>
          <p className="text-sm" style={{ color: "#64748b" }}>
            © 2026 TrackHive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
