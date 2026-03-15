import Link from 'next/link'
import { headers } from 'next/headers'
import { isTrackHiveHost } from '@/lib/domain-brand'

export default async function NotFound() {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const isTrackDomain = isTrackHiveHost(host)

  if (isTrackDomain) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        {/* Big 404 */}
        <p className="text-[120px] md:text-[180px] font-black leading-none text-slate-900 opacity-5 select-none">
          404
        </p>

        <div className="text-center -mt-8 md:-mt-12">
          {/* TrackHive badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">T</span>
            </div>
            <span className="font-black text-slate-900 text-lg">TrackHive</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            This page does not exist. It may have been moved, deleted or never existed.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              ← Back to Home
            </Link>
            <Link
              href="/dashboard/signup"
              className="border border-slate-200 bg-white text-slate-700 font-bold px-6 py-3 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors text-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
            {[
              { label: 'Home', href: '/' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Blog', href: '/blog' },
              { label: 'Features', href: '/features' },
              { label: 'Meta CAPI', href: '/integrations/meta-capi' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-400 hover:text-blue-600 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Help text */}
          <p className="text-slate-400 text-xs mt-10">
            Need help?{' '}
            <Link href="/blog" className="text-blue-500 hover:underline">
              Browse our guides
            </Link>
            {' '}or{' '}
            <Link href="/dashboard/signup" className="text-blue-500 hover:underline">
              start tracking for free
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* Big 404 */}
      <p className="text-[120px] md:text-[180px] font-black leading-none text-white opacity-10 select-none">
        404
      </p>

      <div className="text-center -mt-8 md:-mt-12">
        <h1 className="text-2xl md:text-4xl font-black text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed">
          Looks like this page does not exist. It may have been moved or deleted.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/"
            className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
          <Link
            href="/project"
            className="border border-slate-700 text-white font-bold px-6 py-3 rounded-xl hover:border-slate-500 transition-colors text-sm"
          >
            View Projects
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
          {[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/project' },
            { label: 'My Process', href: '/my-process' },
            { label: 'Resume', href: '/resume' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-500 hover:text-white text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
