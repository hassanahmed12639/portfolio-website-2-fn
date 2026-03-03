import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PrivacyClient from './PrivacyClient'

export default async function PrivacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/dashboard/login')
  }
  return <PrivacyClient />
}




