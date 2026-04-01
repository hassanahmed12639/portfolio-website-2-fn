import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type AuthResult =
  | { user: User; supabase: SupabaseServerClient; error: null; response?: undefined }
  | {
      user: null
      supabase: SupabaseServerClient
      error: unknown
      response: NextResponse
    }

export async function getAuthenticatedUser(): Promise<AuthResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (user) return { user, supabase, error: null }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (session?.user) return { user: session.user, supabase, error: null }

  return {
    user: null,
    supabase,
    error: userError ?? sessionError,
    response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  }
}

