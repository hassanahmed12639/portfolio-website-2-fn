import { createClient } from '@/lib/supabase/server'

/** One place to load the full profile row for dashboard routes (same columns everywhere). */
export async function fetchDashboardProfile(userId: string) {
  const supabase = await await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

