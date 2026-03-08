import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[Team Invite] Auth user ID:', user?.id)
    console.log('[Team Invite] Auth error:', authError)

    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('plan, email, full_name')
      .eq('id', user.id)
      .single()

    console.log('[Team Invite] Profile:', JSON.stringify(profile))
    console.log('[Team Invite] Profile error:', profileError?.message)
    console.log(
      '[Team Invite] Plan check:',
      profile?.plan,
      '=== agency?',
      profile?.plan === 'agency'
    )

    if (profileError) {
      console.error('[Team Invite] Profile lookup failed:', profileError)
      return NextResponse.json(
        {
          error: `Profile lookup failed: ${profileError.message}. User ID: ${user.id}`,
        },
        { status: 500 }
      )
    }

    if (profile?.plan !== 'agency') {
      return NextResponse.json(
        {
          error: `Team members require Agency plan. Your plan: ${profile?.plan ?? 'not found'}`,
        },
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

    const inviteToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { error: insertError } = await admin
      .from('team_members')
      .upsert(
        {
          owner_id: user.id,
          member_email: email.trim(),
          role: role || 'viewer',
          status: 'pending',
          invite_token: inviteToken,
          invite_expires_at: expiresAt.toISOString(),
        },
        { onConflict: 'owner_id,member_email' }
      )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://track.itshassanahmed.com'
    const inviteUrl = `${baseUrl.replace(/\/$/, '')}/invite?token=${inviteToken}`
    const ownerName = profile?.full_name || profile?.email || 'Someone'
    const roleLabel = role || 'viewer'

    const { error: emailError } = await resend.emails.send({
      from:
        process.env.INVITE_FROM_EMAIL || 'TrackHive <onboarding@resend.dev>',
      to: email.trim(),
      subject: `${ownerName} invited you to TrackHive`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">TrackHive</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Server-Side Tracking Platform</p>
            </div>

            <div style="padding: 40px;">
              <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 22px;">You're invited! &#127881;</h2>
              <p style="color: #64748b; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
                <strong style="color: #0f172a;">${ownerName}</strong> has invited you to collaborate on their TrackHive account as a <strong style="color: #2563eb;">${roleLabel}</strong>.
              </p>

              <p style="color: #64748b; margin: 0 0 32px; font-size: 14px; line-height: 1.6;">
                With TrackHive you'll have access to server-side tracking, conversion data, lead management, and real-time analytics.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
                  Accept Invitation &#8594;
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
                This invitation expires in 7 days.<br>
                If you didn't expect this email you can safely ignore it.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                TrackHive by <a href="https://itshassanahmed.com" style="color: #2563eb;">itshassanahmed.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('[Team Invite] Email error:', emailError)
      return NextResponse.json({
        success: true,
        warning: 'Invite saved but email failed to send',
        emailError: emailError.message,
      })
    }

    console.log('[Team Invite] Sent to:', email)

    const { data: members } = await admin
      .from('team_members')
      .select('*')
      .eq('owner_id', user.id)

    return NextResponse.json({ success: true, members: members ?? [] })
  } catch (error: unknown) {
    console.error('[Team Invite] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
