import { createClient } from '@/lib/supabase/server'
import IntegrationsForms from './IntegrationsForms'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const supabase = await createClient()
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

  const meta = integrations?.find((i) => i.platform === 'meta') ?? null
  // Count: Multi-Pixel table + 1 if main Meta integration (form) has a pixel connected
  const activePixelsCount =
    (activePixels?.length ?? 0) + (meta?.pixel_id?.trim() ? 1 : 0)
  const google = integrations?.find((i) => i.platform === 'google') ?? null
  const tiktok = integrations?.find((i) => i.platform === 'tiktok') ?? null
  const ga4 = integrations?.find((i) => i.platform === 'ga4') ?? null

  return (
    <div className="p-6 md:p-8 overflow-auto">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Integrations</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-8">Connect Meta CAPI, Google, TikTok Events API, and GA4.</p>
      <IntegrationsForms
        meta={meta ? { pixel_id: meta.pixel_id, has_access_token: !!meta.access_token, meta_test_event_code: meta.meta_test_event_code } : null}
        metaFbclidCount={metaFbclidCount ?? 0}
        activePixelsCount={activePixelsCount ?? 0}
        google={google ? { tag_id: google.tag_id, conversion_label: google.conversion_label } : null}
        tiktok={tiktok ? { pixel_id: tiktok.pixel_id, has_access_token: !!tiktok.access_token } : null}
        ga4={ga4 ? { tag_id: ga4.ga4_measurement_id ?? ga4.tag_id, has_access_token: !!(ga4.ga4_api_secret ?? ga4.access_token) } : null}
      />
    </div>
  )
}




