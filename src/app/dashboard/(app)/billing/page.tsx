export const dynamic = 'force-dynamic'

import BillingClientSubscriptions from './BillingClientSubscriptions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const { data: activeSubs, error } = await supabase
    .from('subscriptions')
    .select('paypal_subscription_id, plan_name, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    // Don't block the page on billing lookup failures; show "free" fallback.
    console.error('[billing] subscription lookup error:', error)
  }

  const activeSub = activeSubs?.[0] ?? null
  const currentPlan =
    activeSub?.plan_name === 'pro' || activeSub?.plan_name === 'agency'
      ? activeSub.plan_name
      : 'free'

  return (
    <BillingClientSubscriptions
      userId={user.id}
      currentPlan={currentPlan}
      activeSubscriptionId={activeSub?.paypal_subscription_id ?? null}
    />
  )
}

