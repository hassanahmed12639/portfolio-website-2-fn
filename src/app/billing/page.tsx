import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import BillingFormV2 from './BillingFormV2'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Billing — TrackHive Pro',
  description: 'Upgrade to TrackHive Pro. Secure payment via PayPal.',
}

export default async function BillingPage() {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/dashboard/login?redirectTo=/billing`)
  }

  return (
    <div className="trackhive-flow font-sans min-h-screen bg-white antialiased" style={{ color: '#0f172a' }}>
      <TrackHiveNavbar />
      <main className="pt-28 md:pt-32 pb-16 min-h-screen">
        <BillingFormV2 userId={user.id} />
      </main>
      <TrackHiveFooter />
    </div>
  )
}

