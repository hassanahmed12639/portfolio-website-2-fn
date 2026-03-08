import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Team members require Agency plan' },
      { status: 403 }
    )
  }

  const { count } = await admin
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: 'Maximum 5 team members reached' },
      { status: 400 }
    )
  }

  const { email, role } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  const { error } = await admin.from('team_members').insert({
    owner_id: user.id,
    member_email: email.trim(),
    role: role || 'viewer',
    status: 'pending',
  })

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: members } = await admin
    .from('team_members')
    .select('*')
    .eq('owner_id', user.id)

  // TODO: Send invitation email via Resend
  console.log('[Team] Invited:', email, 'role:', role)

  return NextResponse.json({ success: true, members: members ?? [] })
}
