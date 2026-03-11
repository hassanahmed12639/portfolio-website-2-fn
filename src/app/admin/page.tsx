import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PortfolioAdminDashboard from '@/components/admin/PortfolioAdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminAppPage() {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const isPortfolioAdmin = (host === 'itshassanahmed.com' || host === 'www.itshassanahmed.com') && !host.includes('track.')

  if (isPortfolioAdmin) {
    const cookieStore = await cookies()
    const token = cookieStore.get('portfolio_admin_auth')?.value
    const isAuth = token ? (await import('@/lib/portfolio-auth')).verifySessionToken(token) : false
    if (!isAuth) redirect('/admin/login')
    return <PortfolioAdminDashboard />
  }

  redirect('/admin/overview')
}
