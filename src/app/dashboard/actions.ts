'use server'

import { createClient } from '@/lib/supabase/server'

export async function createProfileAfterSignup() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    return
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



