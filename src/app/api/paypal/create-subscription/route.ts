import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { planId, return_url: customReturn, cancel_url: customCancel } = body as {
      planId?: string
      return_url?: string
      cancel_url?: string
    }

    if (!planId) {
      return NextResponse.json({ error: 'planId required' }, { status: 400 })
    }
    const allowedPlans = [
      process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID,
      process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID,
    ].filter(Boolean)
    if (allowedPlans.length === 0) {
      return NextResponse.json({ error: 'PayPal plan IDs are not configured' }, { status: 500 })
    }
    if (!allowedPlans.includes(planId)) {
      return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID
    const secret = process.env.PAYPAL_SECRET

    if (!clientId || !secret) {
      return NextResponse.json({ error: 'PayPal is not configured' }, { status: 500 })
    }

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    const tokenData = await tokenRes.json()
    const access_token = tokenData.access_token

    if (!access_token) {
      return NextResponse.json({ error: 'Failed to get PayPal access token' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = customReturn ? (customReturn.startsWith('http') ? customReturn : `${baseUrl}${customReturn.startsWith('/') ? '' : '/'}${customReturn}`) : `${baseUrl}/dashboard/billing?success=true`
    const cancelUrl = customCancel ? (customCancel.startsWith('http') ? customCancel : `${baseUrl}${customCancel.startsWith('/') ? '' : '/'}${customCancel}`) : `${baseUrl}/pricing?cancelled=true`

    const subRes = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'TrackHive',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    })

    const subscription = await subRes.json()
    const approvalUrl = subscription.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

    if (!approvalUrl) {
      return NextResponse.json(
        { error: subscription.message || 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ approvalUrl, subscriptionId: subscription.id })
  } catch (error) {
    console.error('[paypal/create-subscription] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
