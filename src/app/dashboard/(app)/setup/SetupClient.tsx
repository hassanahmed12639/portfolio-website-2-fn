'use client'

import { useEffect, useState } from 'react'
import CopyButton from './CopyButton'

const ECOMMERCE_EVENT_CODE = `// Track a page view (fires automatically)
trackhive('track', 'PageView', {});

// Track product view
trackhive('track', 'ViewContent', {
  value: 49.99,
  currency: 'USD',
  content_ids: ['PRODUCT_ID'],
  content_name: 'Product Name'
});

// Track add to cart
trackhive('track', 'AddToCart', {
  value: 49.99,
  currency: 'USD',
  content_ids: ['PRODUCT_ID'],
  content_name: 'Product Name'
});

// Track checkout started
trackhive('track', 'InitiateCheckout', {
  value: 49.99,
  currency: 'USD',
  num_items: 1
});

// Track purchase (add to thank you page)
trackhive('track', 'Purchase', {
  value: 49.99,
  currency: 'USD',
  order_id: 'ORDER_123',
  email: 'customer@email.com',
  phone: '+1234567890',
  first_name: 'John',
  last_name: 'Doe'
});`

const LEAD_GEN_EVENT_CODE = `// Track a page view (fires automatically)
trackhive('track', 'PageView', {});

// Track lead form submission
trackhive('track', 'Lead', {
  email: 'lead@email.com',
  phone: '+1234567890',
  first_name: 'John',
  last_name: 'Doe'
});

// Track contact form submission
trackhive('track', 'Contact', {
  email: 'contact@email.com',
  phone: '+1234567890'
});

// Track demo/consultation booking
trackhive('track', 'Schedule', {
  email: 'prospect@email.com',
  value: 0,
  currency: 'USD'
});

// Track registration/signup
trackhive('track', 'CompleteRegistration', {
  email: 'newuser@email.com',
  first_name: 'John',
  last_name: 'Doe'
});

// Track newsletter subscribe
trackhive('track', 'Subscribe', {
  email: 'subscriber@email.com'
});`

type SetupClientProps = {
  apiKey: string
}

export default function SetupClient({ apiKey }: SetupClientProps) {
  const [dashboardType, setDashboardType] = useState<'ecommerce' | 'leadgen'>('ecommerce')
  const [pixelId, setPixelId] = useState<string>('')

  useEffect(() => {
    fetch('/api/dashboard/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.dashboard_type) setDashboardType(data.dashboard_type)
      })
  }, [])

  useEffect(() => {
    fetch('/api/pixels')
      .then((r) => r.json())
      .then((data) => {
        const pixels = data?.pixels ?? []
        const activeMetaPixel = pixels.find(
          (p: { platform?: string; is_active?: boolean; pixel_id?: string }) =>
            p.platform === 'meta' && p.is_active && p.pixel_id
        )
        if (activeMetaPixel?.pixel_id) {
          setPixelId(activeMetaPixel.pixel_id)
        }
      })
  }, [])

  const installSnippet = pixelId
    ? `<!-- TrackHive Tracking -->
<script src="https://track.itshassanahmed.com/th.js?id=${pixelId}"></script>`
    : ''

  const reverseProxySnippet = `<!-- TrackHive with Reverse Proxy -->
<script src="/th-proxy/th?id=${pixelId || 'YOUR_PIXEL_ID'}"></script>`

  const manualEventCode = dashboardType === 'ecommerce' ? ECOMMERCE_EVENT_CODE : LEAD_GEN_EVENT_CODE

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Setup & Snippet</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-8">Get your tracking snippet and add it to your site.</p>

      <div className="space-y-8">
        {/* Section 1 — Your API Key */}
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--dash-text-soft)]">Your API Key</h2>
            <CopyButton text={apiKey} />
          </div>
          <div className="p-4">
            <pre className="bg-[var(--dash-surface-hover)] rounded-lg border border-[var(--dash-border)] shadow-sm p-4 text-sm text-[var(--dash-text-soft)] font-mono overflow-x-auto">
              {apiKey || '(No API key)'}
            </pre>
            <p className="mt-3 text-amber-500/90 text-sm">Keep this private. Do not share it publicly.</p>
          </div>
        </section>

        {/* Section 2 — Install Snippet */}
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--dash-text-soft)]">Install Snippet</h2>
            {pixelId ? <CopyButton text={installSnippet} /> : null}
          </div>
          <div className="p-4">
            {pixelId ? (
              <>
                <pre className="bg-[var(--dash-surface-hover)] rounded-lg border border-[var(--dash-border)] shadow-sm p-4 text-sm text-[var(--dash-text-soft)] font-mono overflow-x-auto whitespace-pre">
                  {installSnippet}
                </pre>
                <p className="mt-3 text-[var(--dash-muted)] text-sm">
                  Paste this code before the closing{' '}
                  <code className="text-[var(--dash-text-soft)] bg-[var(--dash-surface-hover)] px-1 rounded">&lt;/head&gt;</code>{' '}
                  tag on your website.
                </p>
              </>
            ) : (
              <p className="text-sm text-amber-500/90">
                Add your Meta Pixel ID in Integrations first, then return here for your snippet
              </p>
            )}
          </div>
        </section>

        {/* Section 3 — Track Events Manually */}
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)]">
            <h2 className="text-sm font-medium text-[var(--dash-text-soft)]">Track Events Manually</h2>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setDashboardType('ecommerce')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dashboardType === 'ecommerce'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                E-Commerce Events
              </button>
              <button
                type="button"
                onClick={() => setDashboardType('leadgen')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dashboardType === 'leadgen'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Lead Gen Events
              </button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--dash-muted)]">
                {dashboardType === 'ecommerce' ? 'E-commerce event examples' : 'Lead gen event examples'}
              </span>
              <CopyButton text={manualEventCode} />
            </div>
            <pre className="bg-[var(--dash-surface-hover)] rounded-lg border border-[var(--dash-border)] shadow-sm p-4 text-sm text-[var(--dash-text-soft)] font-mono overflow-x-auto whitespace-pre">
              {manualEventCode}
            </pre>
          </div>
        </section>

        {/* Section 4 — Using Reverse Proxy */}
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--dash-text-soft)]">Using Reverse Proxy (Recommended)</h2>
            <CopyButton text={reverseProxySnippet} />
          </div>
          <div className="p-4">
            <p className="text-[var(--dash-muted)] text-sm mb-3">
              Serve the script from your own domain so ad blockers do not block it. Configure rewrites on your
              server (see Reverse Proxy page).
            </p>
            <pre className="bg-[var(--dash-surface-hover)] rounded-lg border border-[var(--dash-border)] shadow-sm p-4 text-sm text-[var(--dash-text-soft)] font-mono overflow-x-auto whitespace-pre">
              {reverseProxySnippet}
            </pre>
          </div>
        </section>

        {/* Section 5 — Meta Signal Capture */}
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)]">
            <h2 className="text-sm font-medium text-[var(--dash-text-soft)]">Meta Signal Capture</h2>
          </div>
          <div className="p-4 space-y-6">
            <p className="text-[var(--dash-muted)] text-sm">
              TrackHive auto-captures <strong className="text-[var(--dash-text-soft)]">fbclid</strong>,{' '}
              <strong className="text-[var(--dash-text-soft)]">fbc</strong>, and{' '}
              <strong className="text-[var(--dash-text-soft)]">fbp</strong> to improve Meta CAPI match rates. No extra
              code required — the snippet handles it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[var(--dash-border)] shadow-sm bg-[var(--dash-surface-hover)] p-4">
                <p className="text-xs font-medium text-amber-400/90 mb-2">WITHOUT Meta Signals</p>
                <p className="text-[var(--dash-muted)] text-sm mb-1">Match rate: ~60–70%</p>
                <p className="text-[var(--dash-muted)] text-xs">Data sent: email, phone</p>
              </div>
              <div className="rounded-lg border border-[var(--dash-success-border)] bg-[var(--dash-success-soft)] p-4">
                <p className="text-xs font-medium text-[var(--dash-success)] mb-2">WITH TrackHive Meta Signals</p>
                <p className="text-[var(--dash-text)] text-sm mb-1">Match rate: ~90–95%</p>
                <p className="text-[var(--dash-muted)] text-xs">
                  Data sent: email, phone, fbc, fbp, fbclid, name, city, zip, country
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--dash-muted)]">What TrackHive auto-captures</p>
              <ul className="text-sm text-[var(--dash-muted)] space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-[var(--dash-text-soft)]">fbp</strong> — Always created. Unique browser
                  fingerprint for Meta.
                </li>
                <li>
                  <strong className="text-[var(--dash-text-soft)]">fbc</strong> — Created when visitor arrives from a
                  Meta ad (fbclid in URL).
                </li>
                <li>
                  <strong className="text-[var(--dash-text-soft)]">fbclid</strong> — Captured from URL when visitor
                  clicks your Meta ad.
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--dash-muted)]">Match rate improvement</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-[var(--dash-muted)] mb-1">
                    <span>Standard pixel</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--dash-surface-hover)] overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-amber-600/80" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[var(--dash-muted)] mb-1">
                    <span>TrackHive CAPI</span>
                    <span>93%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--dash-surface-hover)] overflow-hidden">
                    <div className="h-full w-[93%] rounded-full bg-[var(--dash-success)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 — GTM Instructions */}
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)]">
            <h2 className="text-sm font-medium text-[var(--dash-text)]">Google Tag Manager</h2>
          </div>
          <div className="p-4 text-sm space-y-3">
            <p className="text-[var(--dash-text)]">
              <span className="font-medium">1.</span> Download the{' '}
              <a href="/dashboard/templates" className="text-[var(--dash-text)] underline hover:opacity-80">
                TrackHive GTM template
              </a>
              .
            </p>
            <p className="text-[var(--dash-text)]">
              <span className="font-medium">2.</span> In GTM → Templates → New → Import the .tpl file.
            </p>
            <p className="text-[var(--dash-text)]">
              <span className="font-medium">3.</span> Create a new tag using the TrackHive template.
            </p>
            <p className="text-[var(--dash-text)]">
              <span className="font-medium">4.</span> Enter your API key shown above.
            </p>
            <p className="text-[var(--dash-text)]">
              <span className="font-medium">5.</span> Set your trigger and publish.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
