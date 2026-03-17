'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Code2, Lock } from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'
import { UpgradeModal } from '@/components/UpgradeModal'

const SCRIPT_TAG = `<script src="https://track.itshassanahmed.com/auto-track.js"></script>`

export default function AutoTrackPage() {
  const { plan } = usePlan()
  const isPro = plan === 'pro' || plan === 'agency'
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  return (
    <div className="p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-1">
          Auto-Track
        </h1>
        <p className="text-[var(--dash-muted)] text-sm mb-3">
          Add once. Track everything automatically.
        </p>
        <p className="text-[var(--dash-muted)] text-sm max-w-4xl">
          The Auto-Track script intelligently detects form submits, button clicks, checkout steps, and page navigation on your site — no manual GTM configuration needed. Works with any website including React, Next.js, Shopify, and WordPress.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            'Form Submit Detection',
            'Smart Button Tracking',
            'SPA Page View Tracking',
            'Thank You Page Auto-detect',
          ].map((b) => (
            <span
              key={b}
              className="px-2 py-1 rounded-lg text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)]"
            >
              {b}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {[
          {
            title: 'Install via GTM (Recommended)',
            instructions:
              'In GTM, create a new Custom HTML tag, paste the script below, set trigger to All Pages, and publish.',
          },
          {
            title: 'Install directly in your site',
            instructions:
              "Paste this in the <head> of your website, after your TrackHive pixel snippet.",
          },
        ].map((card) => (
          <section
            key={card.title}
            className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">
                {card.title}
              </h2>
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                {card.instructions}
              </p>
            </div>

            <div className="p-4">
              <div className="relative">
                <div
                  className={`rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] p-4 ${
                    !isPro ? 'blur-sm select-none' : ''
                  }`}
                >
                  <pre className="text-xs text-[var(--dash-muted)] whitespace-pre-wrap font-mono">
                    {SCRIPT_TAG}
                  </pre>
                </div>

                {!isPro && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowUpgrade(true)}
                      className="flex items-center gap-2 bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] text-xs font-medium px-3 py-2 rounded-lg shadow-sm hover:bg-[var(--dash-primary-soft)] hover:text-[var(--dash-primary)] transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      Unlock with Pro
                    </button>
                  </div>
                )}
              </div>

              {isPro && (
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(SCRIPT_TAG)
                    setCopiedKey(card.title)
                    window.setTimeout(() => setCopiedKey(null), 2000)
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] hover:bg-[var(--dash-border)] transition-colors text-sm font-medium"
                >
                  <Code2 className="w-4 h-4" />
                  {copiedKey === card.title ? 'Copied' : 'Copy snippet'}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)]">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">
            What gets tracked automatically
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--dash-muted)]">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Event Fired</th>
                <th className="px-4 py-3 font-medium">Data Captured</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Any form submit', 'generate_lead', 'email, phone, form ID'],
                ['Add to Cart button click', 'add_to_cart', 'page URL'],
                ['Checkout button click', 'begin_checkout', 'page URL'],
                ['Place Order button click', 'purchase', 'page URL'],
                ['Page navigation (SPA)', 'page_view', 'URL, page title'],
                ['Thank you page load', 'purchase', 'page URL'],
                ['Phone number click', 'click_to_call', 'phone number, page URL'],
                ['WhatsApp button click', 'whatsapp_click', 'page URL'],
                ['Outbound link click', 'outbound_click', 'destination URL, page URL'],
                ['File/PDF download', 'file_download', 'file name, file type, page URL'],
                ['Scroll depth 25/50/75/100%', 'scroll_depth', 'depth %, page URL'],
                ['Time on page 30s/60s/120s', 'time_on_page', 'seconds spent, page URL'],
                ['Exit intent (mouse leaves)', 'exit_intent', 'time on page, page URL'],
                ['Video play/pause', 'video_engagement', 'action, % watched, title'],
                ['Text copy', 'content_copy', 'page URL'],
                ['Chat widget open', 'chat_open', 'widget type, page URL'],
              ].map(([action, event, data]) => (
                <tr
                  key={action}
                  className="border-t border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]/30"
                >
                  <td className="px-4 py-3 text-[var(--dash-text)]">{action}</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)] font-mono text-xs">
                    {event}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showUpgrade && (
        <UpgradeModal
          isOpen={true}
          onClose={() => setShowUpgrade(false)}
          feature="Auto-Track"
          requiredPlan="pro"
        />
      )}
    </div>
  )
}

