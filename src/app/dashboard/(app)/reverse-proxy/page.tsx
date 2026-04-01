export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { FeatureGate } from '@/components/FeatureGate'
import ReverseProxyClient from './ReverseProxyClient'

export default async function ReverseProxyPage() {
  const supabase = await await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('api_key')
    .eq('id', user!.id)
    .single()

  const apiKey = profile?.api_key ?? ''

  return (
    <div className="p-6 md:p-8">
      <FeatureGate feature="reverse_proxy" requiredPlan="pro">
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Reverse Proxy</h1>
        <p className="text-[var(--dash-muted)] text-sm mb-8">
          Serve tracking scripts from your own domain so ad blockers do not block them.
        </p>
        <ReverseProxyClient apiKey={apiKey} />
      </FeatureGate>
    </div>
  )
}





