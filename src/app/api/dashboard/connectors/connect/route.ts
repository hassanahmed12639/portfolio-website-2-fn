import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, account_id, access_token } = body

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify token works by making a test API call
    let accountName = account_id
    if (platform === 'meta') {
      const testRes = await fetch(
        `https://graph.facebook.com/v18.0/${account_id.replace(/^act_/, '')}?fields=name&access_token=${access_token}`
      )
      const testData = await testRes.json()
      if (testData.error) throw new Error(`Meta API error: ${testData.error.message}`)
      accountName = testData.name || account_id
    }

    const normalizedAccountId = (account_id || '').toString().replace(/^act_/, '')

    const { error } = await supabaseAdmin
      .from('ad_connections')
      .upsert({
        user_id: user.id,
        platform,
        account_id: normalizedAccountId,
        account_name: accountName,
        access_token,
        is_active: true,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform,account_id' })

    if (error) throw error

    return NextResponse.json({ success: true, accountName })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
