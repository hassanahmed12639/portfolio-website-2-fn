import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PortfolioProjectsAdmin from '@/components/admin/PortfolioProjectsAdmin'
import { hasPortfolioAdminSession, isPortfolioAdminHost } from '@/lib/portfolio-admin'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const host = (await headers()).get('host')
  if (!isPortfolioAdminHost(host)) redirect('/admin/overview')

  const isAuth = await hasPortfolioAdminSession()
  if (!isAuth) redirect('/admin/login')

  return <PortfolioProjectsAdmin />
}
