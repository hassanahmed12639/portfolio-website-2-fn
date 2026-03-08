import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: members } = await admin
    .from('team_members')
    .select('*')
    .eq('owner_id', user.id)
    .order('invited_at', { ascending: false })

  return NextResponse.json({ members: members ?? [] })
}
