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

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-2">Integrations</h1>
      <p className="text-zinc-400 text-sm mb-8">Connect Meta CAPI and Google Enhanced Conversions.</p>
      <IntegrationsForms
        meta={meta ? { pixel_id: meta.pixel_id, access_token: meta.access_token } : null}
        google={google ? { tag_id: google.tag_id } : null}
      />
    </div>
  )
}
