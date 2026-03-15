import { decrypt, encrypt } from '@/lib/encrypt'

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
const GSC_SITES_URL = 'https://www.googleapis.com/webmasters/v3/sites'

export type GoogleTokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
  token_type?: string
}

export type GscSiteEntry = {
  siteUrl: string
  permissionLevel?: string
}

export function normalizeGscSiteUrl(raw: string): string {
  const input = raw.trim()
  if (!input) return ''
  if (input.startsWith('sc-domain:')) return input
  if (/^https?:\/\//i.test(input)) {
    try {
      const u = new URL(input)
      return `${u.protocol}//${u.host}${u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`}`
    } catch {
      return input
    }
  }
  // If user types plain domain, default to domain property because it is broader.
  return `sc-domain:${input.replace(/^www\./i, '').replace(/\/+$/, '')}`
}

export function getGscEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI
  return { clientId, clientSecret, redirectUri }
}

export function buildGoogleOAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGscEnv()
  if (!clientId || !redirectUri) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_OAUTH_REDIRECT_URI')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    state,
  })
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getGscEnv()
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth environment variables')
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error_description?: string }).error_description ?? 'Failed token exchange')
  }
  return data as GoogleTokenResponse
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getGscEnv()
  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth environment variables')
  }

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  })
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error_description?: string }).error_description ?? 'Failed token refresh')
  }
  return data as GoogleTokenResponse
}

export async function fetchGoogleUserEmail(accessToken: string): Promise<string | null> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => ({}))
  const email = (data as { email?: string }).email
  return typeof email === 'string' ? email : null
}

export async function fetchGscSites(accessToken: string): Promise<GscSiteEntry[]> {
  const res = await fetch(GSC_SITES_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: { message?: string } }).error?.message ?? 'Failed to fetch GSC sites')
  }
  return ((data as { siteEntry?: GscSiteEntry[] }).siteEntry ?? []).filter((s) => !!s.siteUrl)
}

export async function querySearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit = 25000
) {
  const encodedSite = encodeURIComponent(siteUrl)
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`
  const allRows: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }> = []
  let startRow = 0
  const maxRows = 100000

  while (startRow < maxRows) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow,
        dataState: 'all',
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error((data as { error?: { message?: string } }).error?.message ?? 'Search analytics query failed')
    }

    const rows = (data as { rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }> }).rows ?? []
    if (rows.length === 0) break
    allRows.push(...rows)
    if (rows.length < rowLimit) break
    startRow += rowLimit
  }

  return allRows
}

export async function encryptIfValue(raw?: string | null): Promise<string | null> {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  return encrypt(trimmed)
}

export async function decryptIfValue(raw?: string | null): Promise<string | null> {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  return decrypt(trimmed)
}
