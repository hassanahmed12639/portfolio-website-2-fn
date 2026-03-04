import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { planId } = await req.json()

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
        return_url: `${baseUrl}/dashboard/billing?success=true`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
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
}
