import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

export interface UserCredentials {
  metaPixelId?: string
  metaAccessToken?: string
  tiktokPixelId?: string
  tiktokAccessToken?: string
  ga4MeasurementId?: string
  ga4ApiSecret?: string
  googleConversionId?: string
  googleConversionLabel?: string
}

type IntegrationRow = {
  platform: string
  pixel_id?: string | null
  access_token?: string | null
  tag_id?: string | null
  conversion_label?: string | null
  conversion_id?: string | null
  ga4_measurement_id?: string | null
  ga4_api_secret?: string | null
}

/**
 * Fetches credentials from the user's integrations table (one row per platform).
 * Falls back to ENV for any missing value so existing behavior is preserved.
 */
export async function getUserCredentials(userId: string): Promise<UserCredentials> {
  const fallback: UserCredentials = {
    metaPixelId: process.env.META_PIXEL_ID,
    metaAccessToken: process.env.META_ACCESS_TOKEN,
    tiktokPixelId: process.env.TIKTOK_PIXEL_ID,
    tiktokAccessToken: process.env.TIKTOK_ACCESS_TOKEN,
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    ga4ApiSecret: process.env.GA4_API_SECRET,
    googleConversionId: process.env.GOOGLE_ADS_CONVERSION_ID,
    googleConversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL,
  }

  try {
    const supabase = getAdmin()
    if (!supabase) return fallback

    const { data: rows } = await supabase
      .from('integrations')
      .select('platform, pixel_id, access_token, tag_id, conversion_label, conversion_id, ga4_measurement_id, ga4_api_secret')
      .eq('user_id', userId)
      .eq('is_active', true)

    const list = (rows as IntegrationRow[] | null) ?? []
    const meta = list.find((r) => r.platform === 'meta')
    const tiktok = list.find((r) => r.platform === 'tiktok')
    const ga4 = list.find((r) => r.platform === 'ga4')
    const google = list.find((r) => r.platform === 'google')

    return {
      metaPixelId: (meta?.pixel_id ?? fallback.metaPixelId)?.trim() || fallback.metaPixelId,
      metaAccessToken: (meta?.access_token ?? fallback.metaAccessToken)?.trim() || fallback.metaAccessToken,
      tiktokPixelId: (tiktok?.pixel_id ?? fallback.tiktokPixelId)?.trim() || fallback.tiktokPixelId,
      tiktokAccessToken: (tiktok?.access_token ?? fallback.tiktokAccessToken)?.trim() || fallback.tiktokAccessToken,
      ga4MeasurementId: (ga4?.ga4_measurement_id ?? ga4?.tag_id ?? fallback.ga4MeasurementId)?.trim() || fallback.ga4MeasurementId,
      ga4ApiSecret: (ga4?.ga4_api_secret ?? ga4?.access_token ?? fallback.ga4ApiSecret)?.trim() || fallback.ga4ApiSecret,
      googleConversionId: (google?.tag_id ?? google?.conversion_id ?? fallback.googleConversionId)?.trim() || fallback.googleConversionId,
      googleConversionLabel: (google?.conversion_label ?? fallback.googleConversionLabel)?.trim() || fallback.googleConversionLabel,
    }
  } catch (error) {
    console.error('[Credentials] Error fetching user credentials:', error)
    return fallback
  }
}
