const TRACK_HOSTS = new Set(['track.itshassanahmed.com'])
const PORTFOLIO_HOSTS = new Set(['itshassanahmed.com', 'www.itshassanahmed.com'])

export function normalizeHost(rawHost: string | null | undefined): string {
  // x-forwarded-host can contain comma-separated chain; take first value.
  const first = (rawHost ?? '').split(',')[0]?.trim() ?? ''
  return first.toLowerCase().split(':')[0]
}

export function isTrackHiveHost(rawHost: string | null | undefined): boolean {
  const host = normalizeHost(rawHost)
  if (!host) return false
  if (TRACK_HOSTS.has(host)) return true
  return host.startsWith('track.')
}

export function isPortfolioHost(rawHost: string | null | undefined): boolean {
  const host = normalizeHost(rawHost)
  return PORTFOLIO_HOSTS.has(host)
}

export function getBrandNameForHost(rawHost: string | null | undefined): 'TrackHive' | 'Hassan Ahmed' {
  return isTrackHiveHost(rawHost) ? 'TrackHive' : 'Hassan Ahmed'
}

