import { headers } from 'next/headers'
import PortfolioAdminLogin from '@/components/admin/PortfolioAdminLogin'
import TrackHiveAdminLogin from '@/components/admin/TrackHiveAdminLogin'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const isPortfolioAdmin = (host === 'itshassanahmed.com' || host === 'www.itshassanahmed.com') && !host.includes('track.')

  if (isPortfolioAdmin) {
    return <PortfolioAdminLogin />
  }

  return <TrackHiveAdminLogin />
}
