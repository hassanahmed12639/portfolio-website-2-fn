import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function getPayPalAccessToken() {
  const baseUrl = process.env.PAYPAL_BASE_URL
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!baseUrl || !clientId || !secret) throw new Error('PayPal is not configured')

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const tokenData = (await tokenRes.json().catch(() => ({}))) as { access_token?: string }
  if (!tokenRes.ok || !tokenData?.access_token) {
    throw new Error('Failed to get PayPal access token')
  }

  return tokenData.access_token
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only read their own row; updates use service role to bypass RLS.
    const { data: activeSubs, error: readError } = await supabase
      .from('subscriptions')
      .select('paypal_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 })
    }

    const activeSub = activeSubs?.[0]
    const subscriptionId = activeSub?.paypal_subscription_id
    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const accessToken = await getPayPalAccessToken()

    const baseUrl = process.env.PAYPAL_BASE_URL!
    const cancelRes = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'User requested cancellation',
      }),
    })

    const cancelData = await cancelRes.json().catch(() => ({}))
    if (!cancelRes.ok) {
      return NextResponse.json(
        { error: cancelData?.message ?? 'Failed to cancel subscription' },
        { status: 502 }
      )
    }

    const admin = createAdminClient()

    await admin
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('paypal_subscription_id', subscriptionId)

    // Keep your current `profiles` plan gating consistent immediately.
    await admin
      .from('profiles')
      .update({
        plan: 'free',
        is_trial: false,
        trial_started_at: null,
        trial_ends_at: null,
        trial_expires_at: null,
        paypal_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_subscription_id', subscriptionId)

    return NextResponse.json({ cancelled: true })
  } catch (error) {
    console.error('[paypal/cancel-subscription] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

