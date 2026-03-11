import Link from 'next/link'

const sections = [
  {
    title: 'Projects',
    description: 'Add, edit and delete portfolio case studies',
    href: '/admin/projects',
    icon: '🗂️',
    color: 'border-blue-800 bg-blue-950',
  },
  {
    title: 'SEO',
    description: 'Manage meta titles and descriptions',
    href: '/admin/seo',
    icon: '🔍',
    color: 'border-green-800 bg-green-950',
  },
  {
    title: 'Tools',
    description: 'Manage tools on my-process page',
    href: '/admin/tools',
    icon: '🛠️',
    color: 'border-purple-800 bg-purple-950',
  },
  {
    title: 'Resume',
    description: 'Update resume and experience',
    href: '/admin/resume',
    icon: '📄',
    color: 'border-orange-800 bg-orange-950',
  },
]

export default function PortfolioAdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black">Portfolio Admin</h1>
            <p className="text-slate-500 text-sm mt-1">itshassanahmed.com</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-slate-500 hover:text-white text-sm transition-colors"
            >
              View Site →
            </Link>
            <form action="/api/admin/portfolio-logout" method="POST">
              <button type="submit" className="text-slate-500 hover:text-red-400 text-sm transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`rounded-2xl border p-6 hover:scale-[1.02] transition-transform ${section.color}`}
            >
              <span className="text-3xl mb-3 block">{section.icon}</span>
              <h2 className="font-black text-white text-lg mb-1">{section.title}</h2>
              <p className="text-slate-400 text-sm">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
