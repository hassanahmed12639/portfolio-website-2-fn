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

  const tokenData = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string
    error?: string
    error_description?: string
  }
  if (!tokenRes.ok || !tokenData?.access_token) {
    const oauthError = tokenData.error_description || tokenData.error || `HTTP ${tokenRes.status}`
    throw new Error(`Failed to get PayPal access token (${tokenRes.status}): ${oauthError}`)
  }

  return tokenData.access_token
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const subscriptionID = body?.subscriptionID
    const user_id = body?.user_id

    if (!subscriptionID || typeof subscriptionID !== 'string') {
      return NextResponse.json({ error: 'subscriptionID is required' }, { status: 400 })
    }

    if (user_id && typeof user_id === 'string' && user_id !== user.id) {
      return NextResponse.json({ error: 'user_id mismatch' }, { status: 403 })
    }

    const paypalBaseUrl = process.env.PAYPAL_BASE_URL
    if (!paypalBaseUrl) return NextResponse.json({ error: 'PAYPAL_BASE_URL is not configured' }, { status: 500 })

    const accessToken = await getPayPalAccessToken()

    // Fetch subscription details so we can store the plan_id.
    const subRes = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const subData = await subRes.json().catch(() => ({}))
    if (!subRes.ok) {
      return NextResponse.json(
        { error: subData?.message ?? 'Failed to fetch PayPal subscription' },
        { status: 502 }
      )
    }

    const planId: string | undefined = subData?.plan_id ?? subData?.plan?.id ?? subData?.plan?.plan_id
    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ error: 'PayPal subscription is missing plan_id' }, { status: 400 })
    }

    const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
    const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID
    if (!proPlanId || !agencyPlanId) {
      return NextResponse.json({ error: 'PayPal plan IDs are not configured' }, { status: 500 })
    }

    const planName = planId === agencyPlanId ? 'agency' : planId === proPlanId ? 'pro' : null
    if (!planName) {
      return NextResponse.json({ error: 'Unknown PayPal plan_id' }, { status: 400 })
    }

    const admin = createAdminClient()

    await admin.from('subscriptions').upsert(
      {
        paypal_subscription_id: subscriptionID,
        paypal_plan_id: planId,
        plan_name: planName,
        user_id: user.id,
        // JS SDK `onApprove` indicates the user approved the subscription.
        // Webhooks will later reconcile the exact status/period dates.
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'paypal_subscription_id' }
    )

    return NextResponse.json({ activated: true })
  } catch (error) {
    console.error('[paypal/activate-subscription] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


