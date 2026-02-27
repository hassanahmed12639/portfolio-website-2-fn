import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReverseProxyClient from './ReverseProxyClient'

export default async function ReverseProxyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('api_key')
    .eq('id', user.id)
    .single()

  const apiKey = profile?.api_key ?? ''

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-2">Reverse Proxy</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Serve tracking scripts from your own domain so ad blockers do not block them.
      </p>
      <ReverseProxyClient apiKey={apiKey} />
    </div>
  )
}
