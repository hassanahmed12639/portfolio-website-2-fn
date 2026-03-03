'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProfileAfterSignup() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const apiKey = crypto.randomUUID()

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      api_key: apiKey,
    },
    { onConflict: 'id' }
  )
}



