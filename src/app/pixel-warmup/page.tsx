import Link from 'next/link'
import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import { Button } from '@/components/ui/button'

export default function PixelWarmupPage() {
  return (
    <div className="trackhive-flow font-sans min-h-screen bg-white text-slate-900 antialiased">
      <TrackHiveNavbar />
      <main className="max-w-6xl mx-auto px-4 lg:px-8 pt-28 pb-16">
        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="mb-6 space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-600 font-semibold">New feature</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950">Server-side Pixel Warmup</h1>
              <p className="max-w-3xl text-slate-600">
                Warm up Meta Conversions API and GA4 measurement protocol using test-mode events so no real ad spend occurs.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold mb-3">How it works</h2>
                <ul className="space-y-2 text-slate-600">
                  <li>• Read a CSV upload with rows for Lead or Purchase events.</li>
                  <li>• Validate event-specific required fields.</li>
                  <li>• Hash email and phone values for Meta compliance.</li>
                  <li>• Send GA4 debug events and Meta test events only.</li>
                  <li>• Queue events with random 60–120s delays and auto-retry failures.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold mb-3">What you need</h2>
                <ul className="space-y-2 text-slate-600">
                  <li>• `measurement_id` + `api_secret` for GA4.</li>
                  <li>• `pixel_id` + `test_event_code` for Meta CAPI.</li>
                  <li>• CSV with required values for Lead or Purchase events.</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Back to home
                </Button>
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Ready to warm up?</h2>
            <p className="text-slate-600 mb-6">
              Use the `startWarmup(eventType, csvFilePath, options)` function inside `pixelWarmup.js` and route your events through test-mode endpoints only.
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-900">Example event types</p>
                <p className="text-slate-600">Lead, Purchase</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">CSV path</p>
                <p className="text-slate-600">`/path/to/data.csv`</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Options</p>
                <pre className="rounded-xl bg-slate-950 p-4 text-sm text-slate-50 overflow-x-auto">
{`{
  credentials: {
    ga4: { measurementId: 'G-XXXX', apiSecret: 'XXXX' },
    meta: { pixelId: '1234567890', testEventCode: 'TEST123' }
  }
}`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>
      <TrackHiveFooter />
    </div>
  )
}
