import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import IntegrationsForms from './IntegrationsForms'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const { data: integrations } = await supabase
    .from('integrations')
    .select('platform, pixel_id, access_token, tag_id')
    .eq('user_id', user.id)

  const meta = integrations?.find((i) => i.platform === 'meta') ?? null
  const google = integrations?.find((i) => i.platform === 'google') ?? null
  const tiktok = integrations?.find((i) => i.platform === 'tiktok') ?? null
  const snapchat = integrations?.find((i) => i.platform === 'snapchat') ?? null
  const ga4 = integrations?.find((i) => i.platform === 'ga4') ?? null

  return (
    <div className="p-6 md:p-8 overflow-auto">
      <h1 className="text-xl font-semibold text-white mb-2">Integrations</h1>
      <p className="text-zinc-400 text-sm mb-8">Connect Meta CAPI, Google, TikTok Events API, Snapchat CAPI, and GA4.</p>
      <IntegrationsForms
        meta={meta ? { pixel_id: meta.pixel_id, access_token: meta.access_token } : null}
        google={google ? { tag_id: google.tag_id } : null}
        tiktok={tiktok ? { pixel_id: tiktok.pixel_id, access_token: tiktok.access_token } : null}
        snapchat={snapchat ? { pixel_id: snapchat.pixel_id, access_token: snapchat.access_token } : null}
        ga4={ga4 ? { tag_id: ga4.tag_id, access_token: ga4.access_token } : null}
      />
    </div>
  )
}
