import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export type EnrichmentSettings = {
  geo_enabled?: boolean
  device_enabled?: boolean
  customer_type_enabled?: boolean
  ltv_enabled?: boolean
  email_hash_enabled?: boolean
  phone_hash_enabled?: boolean
}

export type EnrichInput = {
  ip: string
  userAgent: string
  visitorId: string | null
  email: string | null
  phone: string | null
  userId: string
}

export type EnrichedData = {
  geo: { country: string; city: string; countryCode: string; region: string }
  device: { type: string; browser: string; os: string }
  customer: { type: string; ltv: number; visitCount: number; firstSeen: string | null }
  hashes: { email_hash: string | null; phone_hash: string | null }
}

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function detectDevice(userAgent: string): string {
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function detectBrowser(userAgent: string): string {
  if (/edg/i.test(userAgent)) return 'Edge'
  if (/chrome/i.test(userAgent)) return 'Chrome'
  if (/firefox/i.test(userAgent)) return 'Firefox'
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari'
  return 'Unknown'
}

function detectOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/mac/i.test(userAgent)) return 'MacOS'
  if (/iphone|ipad/i.test(userAgent)) return 'iOS'
  if (/android/i.test(userAgent)) return 'Android'
  return 'Unknown'
}

const emptyGeo = { country: '', city: '', countryCode: '', region: '' }
const emptyDevice = { type: 'unknown', browser: 'Unknown', os: 'Unknown' }
const emptyCustomer = { type: 'new', ltv: 0, visitCount: 1, firstSeen: null }

export async function enrichEvent(
  settings: EnrichmentSettings,
  input: EnrichInput,
  supabase: SupabaseClient
): Promise<EnrichedData> {
  const geo = settings.geo_enabled !== false ? await fetchGeo(input.ip) : emptyGeo
  const device = settings.device_enabled !== false
    ? {
        type: detectDevice(input.userAgent),
        browser: detectBrowser(input.userAgent),
        os: detectOS(input.userAgent),
      }
    : emptyDevice

  let customer = emptyCustomer
  if (settings.customer_type_enabled !== false || settings.ltv_enabled !== false) {
    customer = await fetchCustomer(input.userId, input.visitorId, supabase, settings)
  }

  const hashes = {
    email_hash: (settings.email_hash_enabled !== false && input.email)
      ? sha256(input.email)
      : null,
    phone_hash: (settings.phone_hash_enabled !== false && input.phone)
      ? sha256(input.phone.replace(/\D/g, ''))
      : null,
  }

  return { geo, device, customer, hashes }
}

async function fetchGeo(ip: string): Promise<{ country: string; city: string; countryCode: string; region: string }> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { ...emptyGeo, country: 'Local', city: 'Local' }
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=country,city,regionName,countryCode`,
      { signal: AbortSignal.timeout(3000) }
    )
    const data = await res.json()
    if (data.country != null) {
      return {
        country: data.country ?? '',
        city: data.city ?? '',
        countryCode: data.countryCode ?? '',
        region: data.regionName ?? '',
      }
    }
  } catch {
    // ignore
  }
  return emptyGeo
}

async function fetchCustomer(
  userId: string,
  visitorId: string | null,
  supabase: SupabaseClient,
  settings: EnrichmentSettings
): Promise<{ type: string; ltv: number; visitCount: number; firstSeen: string | null }> {
  let visitCount = 1
  let firstSeen: string | null = null
  if (settings.customer_type_enabled !== false && visitorId) {
    const { data: visitor } = await supabase
      .from('cookie_visitors')
      .select('visit_count, first_seen')
      .eq('user_id', userId)
      .eq('visitor_id', visitorId)
      .single()
    if (visitor) {
      visitCount = visitor.visit_count ?? 1
      firstSeen = visitor.first_seen ?? null
    }
  }

  let ltv = 0
  if (settings.ltv_enabled !== false && visitorId) {
    const { data: purchases } = await supabase
      .from('events')
      .select('payload')
      .eq('user_id', userId)
      .eq('event_name', 'Purchase')
    const list = purchases ?? []
    for (const row of list) {
      const payload = row?.payload as { visitor_id?: string; value?: number } | null
      if (payload?.visitor_id === visitorId) {
        ltv += Number(payload?.value) || 0
      }
    }
  }

  const type = visitCount > 1 ? 'returning' : 'new'
  return { type, ltv, visitCount, firstSeen }
}
