import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { memberId } = await req.json()

  if (!memberId) {
    return NextResponse.json(
      { error: 'memberId is required' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('team_members')
    .delete()
    .eq('id', memberId)
    .eq('owner_id', user.id)

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
