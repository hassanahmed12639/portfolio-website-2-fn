import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CopyButton from './CopyButton'

const SNIPPET_TEMPLATE = (apiKey: string) => `<!-- TrackHive by itshassanahmed.com -->
<script>
  window.TRACKHIVE_KEY = "${apiKey}";
</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>`

const SNIPPET_WITH_PROXY = (apiKey: string) => `<!-- TrackHive with Reverse Proxy -->
<script>
  window.TRACKHIVE_KEY = "${apiKey}";
</script>
<script src="/th-proxy/th" async></script>`

const MANUAL_EVENTS_CODE = `// Track a purchase
TrackHive.track('Purchase', {
  value: 99.00,
  currency: 'USD',
  email: 'customer@email.com'
});

// Track a lead
TrackHive.track('Lead', {
  email: 'lead@email.com'
});

// Track a page view
TrackHive.track('PageView', {});`

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('api_key')
    .eq('id', user.id)
    .single()

  const apiKey = profile?.api_key ?? ''

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-2">Setup & Snippet</h1>
      <p className="text-zinc-400 text-sm mb-8">Get your tracking snippet and add it to your site.</p>

      <div className="space-y-8">
        {/* Section 1 — Your API Key */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Your API Key</h2>
            <CopyButton text={apiKey} />
          </div>
          <div className="p-4">
            <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono overflow-x-auto">
              {apiKey || '(No API key)'}
            </pre>
            <p className="mt-3 text-amber-500/90 text-sm">
              Keep this private. Do not share it publicly.
            </p>
          </div>
        </section>

        {/* Section 2 — Install Snippet */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Install Snippet</h2>
            <CopyButton text={SNIPPET_TEMPLATE(apiKey)} />
          </div>
          <div className="p-4">
            <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre">
              {SNIPPET_TEMPLATE(apiKey)}
            </pre>
            <p className="mt-3 text-zinc-400 text-sm">
              Paste this code before the closing <code className="text-zinc-300 bg-zinc-800 px-1 rounded">&lt;/head&gt;</code> tag on your website.
            </p>
          </div>
        </section>

        {/* Section 3 — Track Events Manually */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Track Events Manually</h2>
            <CopyButton text={MANUAL_EVENTS_CODE} />
          </div>
          <div className="p-4">
            <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre">
              {MANUAL_EVENTS_CODE}
            </pre>
          </div>
        </section>

        {/* Section 4 — Using Reverse Proxy */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Using Reverse Proxy (Recommended)</h2>
            <CopyButton text={SNIPPET_WITH_PROXY(apiKey)} />
          </div>
          <div className="p-4">
            <p className="text-zinc-400 text-sm mb-3">
              Serve the script from your own domain so ad blockers do not block it. Configure rewrites on your server (see Reverse Proxy page).
            </p>
            <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre">
              {SNIPPET_WITH_PROXY(apiKey)}
            </pre>
          </div>
        </section>

        {/* Section 5 — Meta Signal Capture */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Meta Signal Capture</h2>
          </div>
          <div className="p-4 space-y-6">
            <p className="text-zinc-400 text-sm">
              TrackHive auto-captures <strong className="text-zinc-300">fbclid</strong>, <strong className="text-zinc-300">fbc</strong>, and <strong className="text-zinc-300">fbp</strong> to improve Meta CAPI match rates. No extra code required — the snippet handles it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
                <p className="text-xs font-medium text-amber-400/90 mb-2">WITHOUT Meta Signals</p>
                <p className="text-zinc-400 text-sm mb-1">Match rate: ~60–70%</p>
                <p className="text-zinc-500 text-xs">Data sent: email, phone</p>
              </div>
              <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 p-4">
                <p className="text-xs font-medium text-emerald-400 mb-2">WITH TrackHive Meta Signals</p>
                <p className="text-zinc-300 text-sm mb-1">Match rate: ~90–95%</p>
                <p className="text-zinc-500 text-xs">Data sent: email, phone, fbc, fbp, fbclid, name, city, zip, country</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-400">What TrackHive auto-captures</p>
              <ul className="text-sm text-zinc-400 space-y-1.5 list-disc list-inside">
                <li><strong className="text-zinc-300">fbp</strong> — Always created. Unique browser fingerprint for Meta.</li>
                <li><strong className="text-zinc-300">fbc</strong> — Created when visitor arrives from a Meta ad (fbclid in URL).</li>
                <li><strong className="text-zinc-300">fbclid</strong> — Captured from URL when visitor clicks your Meta ad.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-400">Match rate improvement</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Standard pixel</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-amber-600/80" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>TrackHive CAPI</span>
                    <span>93%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-[93%] rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 — GTM Instructions */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Google Tag Manager</h2>
          </div>
          <div className="p-4 text-zinc-400 text-sm space-y-3">
            <p>
              <span className="text-zinc-300 font-medium">1.</span> Download the{' '}
              <a href="#" className="text-zinc-200 underline hover:text-white">TrackHive GTM template</a> (link placeholder for now).
            </p>
            <p>
              <span className="text-zinc-300 font-medium">2.</span> In GTM → Templates → New → Import the .tpl file.
            </p>
            <p>
              <span className="text-zinc-300 font-medium">3.</span> Create a new tag using the TrackHive template.
            </p>
            <p>
              <span className="text-zinc-300 font-medium">4.</span> Enter your API key shown above.
            </p>
            <p>
              <span className="text-zinc-300 font-medium">5.</span> Set your trigger and publish.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
