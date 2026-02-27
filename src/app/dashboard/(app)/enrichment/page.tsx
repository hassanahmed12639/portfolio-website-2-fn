import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EnrichmentClient from './EnrichmentClient'

export default async function EnrichmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-2">Real-time Data Enrichment</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Automatically enrich every event with geolocation, device type, customer type, LTV, and hashed PII for better attribution.
      </p>
      <EnrichmentClient />
    </div>
  )
}
