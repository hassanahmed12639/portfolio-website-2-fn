import { createClient } from '@/lib/supabase/server'
import SetupClient from './SetupClient'

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('api_key')
    .eq('id', user!.id)
    .single()

  const apiKey = profile?.api_key ?? ''

  return <SetupClient apiKey={apiKey} />
}
