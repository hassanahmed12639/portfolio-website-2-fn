import { createClient } from '@/lib/supabase/server'
import PrivacyClient from './PrivacyClient'

export default async function PrivacyPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null
  return <PrivacyClient />
}




