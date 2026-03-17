import { cookies } from 'next/headers'
import { normalizeHost, isPortfolioHost } from '@/lib/domain-brand'
import { getCookieName, verifySessionToken } from '@/lib/portfolio-auth'

export function isPortfolioAdminHost(rawHost: string | null | undefined): boolean {
  const host = normalizeHost(rawHost)
  if (isPortfolioHost(host)) return true
  return host === 'localhost' || host === '127.0.0.1'
}

export async function hasPortfolioAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieName())?.value
  return token ? verifySessionToken(token) : false
}
