import Link from 'next/link'

type Props = {
  title: string
  description: string
  manageHref: string
  manageLabel: string
}

export default function PortfolioAdminSectionPage({
  title,
  description,
  manageHref,
  manageLabel,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black">{title}</h1>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
            Back to Dashboard
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-slate-300 leading-relaxed">{description}</p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={manageHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-200"
            >
              {manageLabel}
            </a>
            <span className="text-xs text-slate-500">
              This section route is now active and no longer returns 404.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
