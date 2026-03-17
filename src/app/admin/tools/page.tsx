import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PortfolioToolsAdmin from '@/components/admin/PortfolioToolsAdmin'
import { hasPortfolioAdminSession, isPortfolioAdminHost } from '@/lib/portfolio-admin'

export const dynamic = 'force-dynamic'

export default async function AdminToolsPage() {
  const host = (await headers()).get('host')
  if (!isPortfolioAdminHost(host)) redirect('/admin/overview')

  const isAuth = await hasPortfolioAdminSession()
  if (!isAuth) redirect('/admin/login')

  return <PortfolioToolsAdmin />
}
