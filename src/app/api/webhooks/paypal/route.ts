import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function getEnvOrThrow(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

function isoOrNull(value: unknown) {
  if (typeof value !== 'string' || !value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function getPlanNameFromPlanId(planId: string | undefined, proPlanId: string | undefined, agencyPlanId: string | undefined) {
  if (!planId) return null
  if (agencyPlanId && planId === agencyPlanId) return 'agency' as const
  if (proPlanId && planId === proPlanId) return 'pro' as const
  return null
}

function extractSubscriptionId(payload: any): string | null {
  const directId = payload?.resource?.id
  if (typeof directId === 'string' && directId) return directId

  // Some payment/sale events use billing_agreement_id for subscriptions.
  const billingAgreementId = payload?.resource?.billing_agreement_id
  if (typeof billingAgreementId === 'string' && billingAgreementId) return billingAgreementId

  return null
}

function extractBillingStartTime(payload: any): string | null {
  const startRaw =
    payload?.resource?.billing_agreement_details?.billing_start_time ??
    payload?.resource?.billing_agreement_details?.start_time ??
    payload?.resource?.billing_agreement_details?.billing_period_start ??
    payload?.resource?.billing_period?.start_time ??
    payload?.resource?.create_time
  return isoOrNull(startRaw)
}

async function getUserIdByEmail(admin: ReturnType<typeof createAdminClient>, email: string) {
  const normalized = email.trim().toLowerCase()
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const user = (data?.users ?? []).find((u) => (u.email ?? '').toLowerCase() === normalized)
  return user?.id ?? null
}

async function getPayPalAccessToken({
  baseUrl,
  clientId,
  secret,
}: {
  baseUrl: string
  clientId: string
  secret: string
}) {
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
    throw new Error(`PayPal access token failed: ${tokenRes.status}`)
  }
  return tokenData.access_token
}

async function verifyPayPalWebhookSignature({
  baseUrl,
  accessToken,
  webhookId,
  body,
  headers,
}: {
  baseUrl: string
  accessToken: string
  webhookId: string
  body: any
  headers: Headers
}) {
  const transmissionId = headers.get('paypal-transmission-id')
  const transmissionTime = headers.get('paypal-transmission-time')
  const certUrl = headers.get('paypal-cert-url')
  const authAlgo = headers.get('paypal-auth-algo')
  const transmissionSig = headers.get('paypal-transmission-sig')

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) return false

  const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
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

  const verifyData = await verifyRes.json().catch(() => ({}))
  return verifyRes.ok && verifyData?.verification_status === 'SUCCESS'
}

export async function POST(req: NextRequest) {
  try {
    const paypalBaseUrl = getEnvOrThrow('PAYPAL_BASE_URL', process.env.PAYPAL_BASE_URL)
    const webhookId = getEnvOrThrow('PAYPAL_WEBHOOK_ID', process.env.PAYPAL_WEBHOOK_ID)
    const clientId = getEnvOrThrow('PAYPAL_CLIENT_ID', process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
    const secret = getEnvOrThrow('PAYPAL_SECRET', process.env.PAYPAL_SECRET)
    const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
    const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID

    const body = await req.json()
    const eventType = body?.event_type
    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ error: 'Missing event_type' }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken({ baseUrl: paypalBaseUrl, clientId, secret })

    const isValid = await verifyPayPalWebhookSignature({
      baseUrl: paypalBaseUrl,
      accessToken,
      webhookId,
      body,
      headers: req.headers,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const admin = createAdminClient()

    const subscriptionId = extractSubscriptionId(body)
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Unable to extract subscription id' }, { status: 400 })
    }

    // We'll use status updates for all subscription-related events. Only ACTIVATED requires
    // mapping subscriber email -> auth.users -> subscriptions.user_id.
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const planId = body?.resource?.plan_id as string | undefined
      const planName = getPlanNameFromPlanId(planId, proPlanId, agencyPlanId)
      if (!planName) {
        return NextResponse.json({ error: 'Unknown PayPal plan_id' }, { status: 400 })
      }

      const payerEmail = body?.resource?.subscriber?.email_address as string | undefined
      const userId = payerEmail ? await getUserIdByEmail(admin, payerEmail) : null

      await admin
        .from('subscriptions')
        .upsert(
          {
            paypal_subscription_id: subscriptionId,
            paypal_plan_id: planId ?? null,
            plan_name: planName,
            status: 'active',
            user_id: userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'paypal_subscription_id' }
        )

      // Keep existing feature-gating compatible with your current `profiles`-based system.
      if (userId) {
        await admin
          .from('profiles')
          .update({
            plan: planName,
            is_trial: false,
            trial_started_at: null,
            trial_ends_at: null,
            trial_expires_at: null,
            paypal_subscription_id: subscriptionId,
            plan_activated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }

      return NextResponse.json({ received: true })
    }

    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      await admin
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)

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

      return NextResponse.json({ received: true })
    }

    if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
      await admin
        .from('subscriptions')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)

      // If suspended, treat as free for access until it resumes successfully.
      await admin
        .from('profiles')
        .update({
          plan: 'free',
          is_trial: false,
          trial_started_at: null,
          trial_ends_at: null,
          trial_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)

      return NextResponse.json({ received: true })
    }

    if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      await admin
        .from('subscriptions')
        .update({ status: 'payment_failed', updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)

      await admin
        .from('profiles')
        .update({
          plan: 'free',
          is_trial: false,
          trial_started_at: null,
          trial_ends_at: null,
          trial_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)

      return NextResponse.json({ received: true })
    }

    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      const currentPeriodStart = extractBillingStartTime(body)

      await admin
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: currentPeriodStart ?? undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)

      // Try to keep `profiles` in sync if we can determine the plan.
      const { data: existingSub } = await admin
        .from('subscriptions')
        .select('plan_name')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      const planName = existingSub?.plan_name
      if (planName === 'pro' || planName === 'agency') {
        await admin
          .from('profiles')
          .update({
            plan: planName,
            is_trial: false,
            trial_started_at: null,
            trial_ends_at: null,
            trial_expires_at: null,
            paypal_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', subscriptionId)
      }

      return NextResponse.json({ received: true })
    }

    // Unknown events are acknowledged but ignored.
    return NextResponse.json({ received: true, ignored: true })
  } catch (error) {
    console.error('[paypal/webhooks/paypal] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

