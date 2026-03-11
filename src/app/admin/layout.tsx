import { headers } from 'next/headers'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const isPortfolioAdmin = (host === 'itshassanahmed.com' || host === 'www.itshassanahmed.com') && !host.includes('track.')

  if (isPortfolioAdmin) {
    return <>{children}</>
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
