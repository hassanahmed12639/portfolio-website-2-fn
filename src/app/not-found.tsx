import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-blue-600 mb-4">404</p>
        <p className="text-xl font-semibold text-slate-900 mb-2">Page not found</p>
        <p className="text-slate-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/trackhive" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Go to TrackHive
          </Link>
          <Link href="/dashboard" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
