import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import BillingForm from './BillingForm'

export const metadata = {
  title: 'Billing — TrackHive Pro',
  description: 'Upgrade to TrackHive Pro. Secure payment via PayPal.',
}

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-white antialiased" style={{ color: '#0f172a' }}>
      <TrackHiveNavbar />
      <main className="pt-28 md:pt-32 pb-16 min-h-screen">
        <BillingForm />
      </main>
      <TrackHiveFooter />
    </div>
  )
}
