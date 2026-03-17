import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/request-security'

export async function GET(req: NextRequest) {
  const rateLimitResponse = enforceRateLimit(req, 'team-invite', 15, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const token = new URL(req.url).searchParams.get('token')
  if (!token || token.length < 20 || token.length > 128) {
    return NextResponse.json({ valid: false })
  }

  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('team_members')
    .select('*')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .gt('invite_expires_at', new Date().toISOString())
    .single()

  if (!invite) return NextResponse.json({ valid: false })

  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const users = data?.users ?? []
  const isNewUser = !users.some(
    (u) => u.email?.toLowerCase() === invite.member_email?.toLowerCase()
  )

  return NextResponse.json({ valid: true, invite, isNewUser })
}
