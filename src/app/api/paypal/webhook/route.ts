import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const eventType = body.event_type

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
}
