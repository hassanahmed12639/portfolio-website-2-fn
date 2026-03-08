import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { token, password, name, isNewUser } = await req.json()

    const admin = createAdminClient()

    const { data: invite } = await admin
      .from('team_members')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .gt('invite_expires_at', new Date().toISOString())
      .single()

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      )
    }

    let memberId: string

    if (isNewUser) {
      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }

      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email: invite.member_email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name || '' },
        })

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        )
      }

      memberId = newUser.user.id

      await admin.from('profiles').insert({
        id: memberId,
        email: invite.member_email,
        full_name: name || '',
        plan: 'free',
        team_owner_id: invite.owner_id,
      })
    } else {
      const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const users = data?.users ?? []
      const existingUser = users.find(
        (u) =>
          u.email?.toLowerCase() === invite.member_email?.toLowerCase()
      )

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      memberId = existingUser.id

      await admin
        .from('profiles')
        .update({ team_owner_id: invite.owner_id })
        .eq('id', memberId)
    }

    await admin
      .from('team_members')
      .update({
        member_id: memberId,
        status: 'active',
        joined_at: new Date().toISOString(),
        invite_token: null,
      })
      .eq('id', invite.id)

    console.log('[Team] Member accepted invite:', invite.member_email)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Team Accept] Error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
