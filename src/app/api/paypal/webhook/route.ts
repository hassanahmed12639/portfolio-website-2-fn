import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID
    const secret = process.env.PAYPAL_SECRET
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!supabaseUrl || !serviceRoleKey || !clientId || !secret || !webhookId) {
      return NextResponse.json({ error: 'Webhook server misconfiguration' }, { status: 500 })
    }

    const body = await req.json()
    const eventType = body.event_type
    const transmissionId = req.headers.get('paypal-transmission-id')
    const transmissionTime = req.headers.get('paypal-transmission-time')
    const certUrl = req.headers.get('paypal-cert-url')
    const authAlgo = req.headers.get('paypal-auth-algo')
    const transmissionSig = req.headers.get('paypal-transmission-sig')
    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return NextResponse.json({ error: 'Missing PayPal signature headers' }, { status: 400 })
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
    const accessToken = tokenData?.access_token as string | undefined
    if (!tokenRes.ok || !accessToken) {
      return NextResponse.json({ error: 'Failed PayPal auth' }, { status: 502 })
    }

    const verifyRes = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: body,
      }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyRes.ok || verifyData?.verification_status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = body.resource.id
      const planId = body.resource.plan_id
      const payerEmail = body.resource.subscriber?.email_address
      const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
      const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID
      const plan = planId === agencyPlanId ? 'agency' : planId === proPlanId ? 'pro' : 'free'

      if (payerEmail) {
        await supabaseAdmin
          .from('profiles')
          .update({
            plan,
            paypal_subscription_id: subscriptionId,
            plan_activated_at: new Date().toISOString(),
          })
          .eq('email', payerEmail)
      }
    }

    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
      await supabaseAdmin
        .from('profiles')
        .update({
          plan: 'free',
          paypal_subscription_id: null,
        })
        .eq('paypal_subscription_id', body.resource.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[paypal/webhook] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
