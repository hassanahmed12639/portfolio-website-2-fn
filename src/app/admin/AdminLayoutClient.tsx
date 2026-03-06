'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const AdminShell = dynamic(
  () =>
    import('@/components/admin/AdminShell').then((m) => ({
      default: m.AdminShell,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    ),
  }
)

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginOrLogout =
    pathname === '/admin/login' || pathname === '/admin/logout'

  if (isLoginOrLogout) {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}
