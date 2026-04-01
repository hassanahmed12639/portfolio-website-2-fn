import { createClient } from '@/lib/supabase/server'
import IntegrationsForms from './IntegrationsForms'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="p-6 md:p-8 overflow-auto">
        <p className="text-[var(--dash-muted)]">Please sign in to view integrations.</p>
      </div>
    )
  }

  const { data: integrations } = await supabase
    .from('integrations')
    .select('platform, pixel_id, access_token, tag_id, meta_test_event_code, conversion_label, conversion_id, ga4_measurement_id, ga4_api_secret')
    .eq('user_id', user.id)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: activePixels } = await supabase
    .from('pixels')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'meta')
    .eq('is_active', true)

  const { count: metaFbclidCount } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('fbclid', 'is', null)
    .gte('created_at', startOfMonth.toISOString())

  const metaRow = integrations?.find((i) => i.platform === 'meta') ?? null
  // Don't pass email-like values as pixel_id — Meta Pixel IDs are numeric (e.g. 1234567890123456)
  const metaPixelId = metaRow?.pixel_id && !metaRow.pixel_id.includes('@')
    ? metaRow.pixel_id
    : null
  const meta = metaRow ? { pixel_id: metaPixelId, has_access_token: !!metaRow.access_token, meta_test_event_code: metaRow.meta_test_event_code } : null
  // Count: Multi-Pixel table + 1 if main Meta integration (form) has a valid pixel connected
  const activePixelsCount =
    (activePixels?.length ?? 0) + (metaPixelId?.trim() ? 1 : 0)
  const google = integrations?.find((i) => i.platform === 'google') ?? null
  const tiktokRow = integrations?.find((i) => i.platform === 'tiktok') ?? null
  // Don't pass email-like values as pixel_id — TikTok Pixel IDs are alphanumeric (e.g. CXXXXXXXX)
  const tiktokPixelId = tiktokRow?.pixel_id && !tiktokRow.pixel_id.includes('@')
    ? tiktokRow.pixel_id
    : null
  const tiktok = tiktokRow ? { pixel_id: tiktokPixelId, has_access_token: !!tiktokRow.access_token } : null
  const ga4 = integrations?.find((i) => i.platform === 'ga4') ?? null

  return (
    <div className="p-6 md:p-8 overflow-auto">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Integrations</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-8">Connect Meta CAPI, Google, TikTok Events API, and GA4.</p>
      <IntegrationsForms
        meta={meta}
        metaFbclidCount={metaFbclidCount ?? 0}
        activePixelsCount={activePixelsCount ?? 0}
        google={google ? { tag_id: google.tag_id, conversion_label: google.conversion_label } : null}
        tiktok={tiktok}
        ga4={ga4 ? { tag_id: ga4.ga4_measurement_id ?? ga4.tag_id, has_access_token: !!(ga4.ga4_api_secret ?? ga4.access_token) } : null}
      />
    </div>
  )
}





