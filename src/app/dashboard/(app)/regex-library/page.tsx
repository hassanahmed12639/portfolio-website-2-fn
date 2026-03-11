'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { REGEX_PATTERNS, RegexPattern } from '@/data/regex-patterns'
import { usePlan } from '@/hooks/usePlan'
import { UpgradeModal } from '@/components/UpgradeModal'

const TOOLS = ['All', 'GA4', 'Search Console', 'GTM'] as const

export default function RegexLibraryPage() {
  const { plan } = usePlan()
  const isPaidPlan = plan === 'pro' || plan === 'agency'

  const [activeTool, setActiveTool] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const filtered = REGEX_PATTERNS.filter(p => {
    const matchesTool = activeTool === 'All' || p.tool === activeTool
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    return matchesTool && matchesSearch
  })

  const freeCount = REGEX_PATTERNS.filter(p => !p.isPro).length
  const proCount = REGEX_PATTERNS.filter(p => p.isPro).length

  async function handleCopy(pattern: RegexPattern) {
    if (pattern.isPro && !isPaidPlan) {
      setShowUpgrade(true)
      return
    }
    await navigator.clipboard.writeText(pattern.pattern)
    setCopiedId(pattern.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toolColors: Record<string, string> = {
    GA4: 'bg-orange-100 text-orange-700 border-orange-200',
    'Search Console': 'bg-green-100 text-green-700 border-green-200',
    GTM: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-normal text-[var(--dash-text)] mb-1">
              Regex Pattern Library
            </h1>
            <p className="text-[var(--dash-muted)] text-sm">
              Ready-to-use regex patterns for GA4, Search Console and GTM. Copy and paste directly.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] px-4 py-2 rounded-xl text-sm font-normal hover:bg-[var(--dash-surface-hover)] transition-all"
            >
              How to Use
            </button>
            {!isPaidPlan && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-2 bg-[var(--dash-primary)] text-white px-4 py-2 rounded-xl text-sm font-normal hover:bg-[var(--dash-primary-strong)] transition-all shadow-sm"
              >
                Unlock {proCount} Pro Patterns
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Total Patterns', value: REGEX_PATTERNS.length, color: 'text-[var(--dash-text)]' },
            { label: 'Free Patterns', value: freeCount, color: 'text-[var(--dash-success)]' },
            { label: 'Pro Patterns', value: proCount, color: 'text-[var(--dash-primary)]' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--dash-card)] rounded-xl border border-[var(--dash-border)] p-4 text-center">
              <p className={`text-2xl font-normal ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--dash-muted)] mt-0.5 font-normal">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
          <input
            type="text"
            placeholder="Search patterns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl text-sm text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TOOLS.map(tool => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              className={`px-4 py-2.5 rounded-xl text-sm font-normal transition-all border ${
                activeTool === tool
                  ? 'bg-[var(--dash-text)] text-white border-[var(--dash-text)]'
                  : 'bg-[var(--dash-surface)] text-[var(--dash-text)] border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]'
              }`}
            >
              {tool}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTool === tool ? 'bg-white/20 text-white' : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]'
              }`}>
                {tool === 'All'
                  ? REGEX_PATTERNS.length
                  : REGEX_PATTERNS.filter(p => p.tool === tool).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pattern grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--dash-muted)]">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-normal">No patterns found for that search</p>
          <p className="text-sm mt-1">Try a different keyword or clear the search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(pattern => {
            const isLocked = pattern.isPro && !isPaidPlan
            return (
              <div
                key={pattern.id}
                className={`bg-[var(--dash-card)] rounded-2xl border p-5 flex flex-col gap-3 transition-all ${
                  isLocked
                    ? 'border-[var(--dash-border)] opacity-90'
                    : 'border-[var(--dash-border)] hover:border-[var(--dash-accent-border)] hover:shadow-sm'
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-normal px-2 py-0.5 rounded-full border ${toolColors[pattern.tool]}`}>
                        {pattern.tool}
                      </span>
                      <span className="text-xs text-[var(--dash-muted)] font-normal">
                        {pattern.category}
                      </span>
                    </div>
                    <h3 className="font-normal text-[var(--dash-text)] text-sm leading-snug">
                      {pattern.name}
                    </h3>
                  </div>
                  {pattern.isPro && (
                    <span className={`flex-shrink-0 text-xs font-normal px-2 py-0.5 rounded-full ${
                      isPaidPlan
                        ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]'
                        : 'bg-[var(--dash-surface-hover)] text-[var(--dash-warning)]'
                    }`}>
                      {isPaidPlan ? 'PRO' : 'PRO'}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--dash-muted)] leading-relaxed">
                  {pattern.description}
                </p>

                {/* Regex pattern */}
                <div className="relative">
                  <div className={`bg-[var(--dash-primary-soft)] border border-[var(--dash-accent-border)] rounded-xl p-3 ${isLocked ? 'blur-sm select-none' : ''}`}>
                    <p className="text-xs text-[var(--dash-text)] font-mono break-all leading-relaxed">
                      {pattern.pattern}
                    </p>
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setShowUpgrade(true)}
                        className="bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] text-xs font-normal px-3 py-1.5 rounded-lg shadow-sm hover:bg-[var(--dash-primary-soft)] hover:text-[var(--dash-primary)] transition-all"
                      >
                        Unlock with Pro
                      </button>
                    </div>
                  )}
                </div>

                {/* Where to use */}
                <div>
                  <p className="text-xs font-normal text-[var(--dash-muted)] uppercase tracking-wide mb-1.5">
                    Where to use
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pattern.whereToUse.map((step, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-2 py-1 rounded-lg border border-[var(--dash-border)]"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(pattern)}
                  className={`w-full py-2 rounded-xl text-xs font-normal transition-all mt-auto ${
                    isLocked
                      ? 'bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-primary-strong)]'
                      : copiedId === pattern.id
                        ? 'bg-[var(--dash-success)] text-white'
                        : 'bg-[var(--dash-text)] text-white hover:opacity-90'
                  }`}
                >
                  {isLocked
                    ? 'Upgrade to Copy'
                    : copiedId === pattern.id
                      ? 'Copied'
                      : 'Copy Pattern'}
                </button>

              </div>
            )
          })}
        </div>
      )}

      {/* Bottom upgrade banner — only for free users */}
      {!isPaidPlan && (
        <div className="mt-10 bg-[var(--dash-text)] rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-normal mb-2">
            Unlock {proCount} Pro Regex Patterns
          </h2>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            Get advanced filters for bot exclusion, dynamic product URLs, checkout funnel tracking, keyword intent analysis and more.
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="bg-[var(--dash-primary)] text-white font-normal px-8 py-3 rounded-xl hover:bg-[var(--dash-primary-strong)] transition-colors text-sm"
          >
            Upgrade to Pro — $15/month
          </button>
          <p className="text-white/60 text-xs mt-3">Cancel anytime · Instant access</p>
        </div>
      )}

      {/* How to Use Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--dash-border)]">

            {/* Modal header */}
            <div className="sticky top-0 bg-[var(--dash-card)] border-b border-[var(--dash-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-normal text-[var(--dash-text)]">How to Use Regex Patterns</h2>
                <p className="text-xs text-[var(--dash-muted)] mt-0.5">Step-by-step guides for GA4, Search Console and GTM</p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] transition-colors text-[var(--dash-muted)] font-normal text-sm"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-8">

              {/* What is Regex */}
              <div className="bg-[var(--dash-primary-soft)] border border-[var(--dash-accent-border)] rounded-2xl p-5">
                <h3 className="font-normal text-[var(--dash-text)] mb-2">
                  What is a Regex Pattern?
                </h3>
                <p className="text-sm text-[var(--dash-text)] leading-relaxed">
                  Regex (Regular Expression) is a pattern matching language. In analytics tools it lets you match multiple URLs, keywords or values at once using a single filter. Instead of adding 10 separate filters, one regex pattern can match all of them simultaneously.
                </p>
                <div className="mt-3 bg-[var(--dash-surface)] rounded-xl p-3 border border-[var(--dash-border)]">
                  <p className="text-xs text-[var(--dash-muted)] mb-1 font-normal">Example:</p>
                  <code className="text-xs text-[var(--dash-success)] font-mono">/(pricing|checkout|thank-you).*</code>
                  <p className="text-xs text-[var(--dash-muted)] mt-1">This matches any URL containing pricing, checkout or thank-you — all in one filter.</p>
                </div>
              </div>

              {/* GA4 Guide */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-100 text-orange-700 text-xs font-normal px-2.5 py-1 rounded-full border border-orange-200">GA4</span>
                  <h3 className="font-normal text-[var(--dash-text)] text-base">How to Use Regex in Google Analytics 4</h3>
                </div>

                <div className="space-y-4">

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Method 1 — Exploration Reports (most common)</p>
                    <ol className="space-y-2">
                      {[
                        'Open Google Analytics 4 and go to Explore in the left sidebar',
                        'Create a new Free Form exploration or open an existing one',
                        'In the Filters section at the top right click Add new condition',
                        'Select the dimension you want to filter — usually Page Path or Session Medium',
                        'Change the match type from Contains to Matches Regex',
                        'Paste your regex pattern from TrackHive into the value field',
                        'Click Apply — your report now shows only matching data',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Method 2 — Audience Builder (for remarketing)</p>
                    <ol className="space-y-2">
                      {[
                        'Go to Admin → Audiences → New Audience',
                        'Click Create a custom audience',
                        'Add condition — select Page View → Page Path',
                        'Change match type to Matches Regex',
                        'Paste your pattern and set membership duration',
                        'Name your audience and click Save',
                        'Link to Google Ads to use for remarketing campaigns',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Method 3 — Data Filters (permanent filters)</p>
                    <ol className="space-y-2">
                      {[
                        'Go to Admin → Data Filters → Create Filter',
                        'Choose Internal Traffic or Developer Traffic filter type',
                        'Set the matching parameter — IP address or traffic type',
                        'Use regex to match IP ranges like ^192\\.168\\.',
                        'Set filter state to Active and click Save',
                        'This permanently removes matching traffic from all reports',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] rounded-xl p-4">
                    <p className="text-xs font-normal text-[var(--dash-text)] mb-1">GA4 Regex Tips</p>
                    <ul className="space-y-1">
                      {[
                        'GA4 regex is case sensitive by default — use lowercase patterns',
                        'Dots in IP addresses must be escaped with backslash: 192\\.168\\.',
                        'Use ^ to match start of string and $ to match end',
                        'Test your pattern on a small date range before applying permanently',
                      ].map((tip, i) => (
                        <li key={i} className="text-xs text-[var(--dash-muted)] flex items-start gap-1.5">
                          <span className="mt-0.5">•</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              {/* Search Console Guide */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-green-100 text-green-700 text-xs font-normal px-2.5 py-1 rounded-full border border-green-200">Search Console</span>
                  <h3 className="font-normal text-[var(--dash-text)] text-base">How to Use Regex in Google Search Console</h3>
                </div>

                <div className="space-y-4">

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Filter Queries with Regex</p>
                    <ol className="space-y-2">
                      {[
                        'Open Google Search Console and click Performance in the left sidebar',
                        'Make sure you are on the Search Results tab',
                        'Click the + New button at the top to add a filter',
                        'Select Query from the dropdown menu',
                        'Change the filter type from Contains to Custom Regex',
                        'Paste your regex pattern into the input field',
                        'Click Apply — the report instantly filters to matching queries only',
                        'Export to Google Sheets for deeper analysis',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Filter Pages with Regex</p>
                    <ol className="space-y-2">
                      {[
                        'In the Performance report click the Pages tab',
                        'Click + New filter and select Page',
                        'Select Custom Regex as the match type',
                        'Paste your URL pattern to filter specific page groups',
                        'Combine with the Queries tab to see keywords for specific page types',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Pro Workflow — Find Quick Win Keywords</p>
                    <ol className="space-y-2">
                      {[
                        'Open Performance → Queries tab',
                        'Apply the Non-Branded Queries regex to remove brand searches',
                        'Click Impressions column to sort by highest impressions',
                        'Click + New filter again and add Position is greater than 3',
                        'These are your best quick win keywords — ranking but not in top 3',
                        'Update page titles, meta descriptions and H1s for these pages',
                        'Check back in 2 weeks to see position improvements',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] rounded-xl p-4">
                    <p className="text-xs font-normal text-[var(--dash-text)] mb-1">Search Console Regex Tips</p>
                    <ul className="space-y-1">
                      {[
                        'Search Console regex is case insensitive — no need to worry about uppercase',
                        'Filters apply to the last 3 months of data by default',
                        'You can combine multiple filters — query regex + country + device',
                        'Export filtered data to Sheets for pivot tables and deeper analysis',
                        'Regex filters do not permanently change your data — they are view only',
                      ].map((tip, i) => (
                        <li key={i} className="text-xs text-[var(--dash-muted)] flex items-start gap-1.5">
                          <span className="mt-0.5">•</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              {/* GTM Guide */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-normal px-2.5 py-1 rounded-full border border-blue-200">GTM</span>
                  <h3 className="font-normal text-[var(--dash-text)] text-base">How to Use Regex in Google Tag Manager</h3>
                </div>

                <div className="space-y-4">

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Create a Regex Trigger in GTM</p>
                    <ol className="space-y-2">
                      {[
                        'Open Google Tag Manager and go to Triggers in the left menu',
                        'Click New to create a new trigger',
                        'Choose Page View as the trigger type',
                        'Under This trigger fires on select Some Page Views',
                        'Set the condition to Page Path — then change Contains to Matches RegEx',
                        'Paste your regex pattern into the value field',
                        'Name your trigger clearly e.g. PV - Checkout Pages Only',
                        'Click Save and attach this trigger to your conversion tags',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Add a Regex Exception (Exclusion Trigger)</p>
                    <ol className="space-y-2">
                      {[
                        'Create a new trigger and choose Page View',
                        'Select Some Page Views and set Page Path Matches RegEx',
                        'Paste your exclusion pattern e.g. /(admin|dashboard|login).*',
                        'Save this as your exception trigger',
                        'Open your main tag and scroll to Triggering',
                        'Click the exception icon next to your main trigger',
                        'Select the exclusion trigger you just created',
                        'Now the tag fires everywhere except admin and dashboard pages',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] rounded-xl p-4 border border-[var(--dash-border)]">
                    <p className="text-sm font-normal text-[var(--dash-text)] mb-3">Test Your GTM Regex with Preview Mode</p>
                    <ol className="space-y-2">
                      {[
                        'Before publishing always click Preview in the top right of GTM',
                        'Enter your website URL and click Start',
                        'Navigate to a page your regex should match',
                        'In the GTM debug panel check if your trigger shows as Fired',
                        'Navigate to a page it should NOT match and verify it shows as Not Fired',
                        'Once confirmed click Submit in GTM to publish your changes',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--dash-muted)]">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-normal flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] rounded-xl p-4">
                    <p className="text-xs font-normal text-[var(--dash-text)] mb-1">GTM Regex Tips</p>
                    <ul className="space-y-1">
                      {[
                        'Always test in Preview Mode before publishing — a wrong regex can break all tracking',
                        'GTM regex matches against the full URL by default — include domain or use Page Path variable',
                        'Use Page Path variable not Page URL when matching URL slugs without domain',
                        'Escape special characters — dots, slashes and question marks need a backslash prefix',
                        'Name triggers clearly so the team knows what each regex does',
                      ].map((tip, i) => (
                        <li key={i} className="text-xs text-[var(--dash-muted)] flex items-start gap-1.5">
                          <span className="mt-0.5">•</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              {/* Quick reference */}
              <div>
                <h3 className="font-normal text-[var(--dash-text)] text-base mb-4">Regex Quick Reference</h3>
                <div className="bg-[var(--dash-text)] rounded-xl p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { symbol: '^', meaning: 'Start of string', example: '^/blog' },
                      { symbol: '$', meaning: 'End of string', example: '/checkout$' },
                      { symbol: '.*', meaning: 'Match anything', example: '/blog/.*' },
                      { symbol: '(a|b)', meaning: 'Match a OR b', example: '(cart|checkout)' },
                      { symbol: '?', meaning: 'Previous char optional', example: '/products?/' },
                      { symbol: '[a-z]', meaning: 'Any letter a to z', example: '[a-z0-9-]+' },
                      { symbol: '+', meaning: 'One or more', example: '/[\\w-]+/' },
                      { symbol: '\\.', meaning: 'Literal dot', example: '192\\.168\\.' },
                      { symbol: '(?!...)', meaning: 'Negative lookahead', example: '^(?!.*admin)' },
                      { symbol: '{n,}', meaning: 'n or more of previous', example: '(\\S+\\s){4,}' },
                    ].map(row => (
                      <div key={row.symbol} className="flex items-center gap-3">
                        <code className="text-[var(--dash-success)] font-mono text-xs w-20 flex-shrink-0">{row.symbol}</code>
                        <div>
                          <p className="text-white/80 text-xs">{row.meaning}</p>
                          <code className="text-white/60 font-mono text-xs">{row.example}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-3 bg-[var(--dash-text)] text-white font-normal rounded-xl hover:opacity-90 transition-colors text-sm"
              >
                Close Guide
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {showUpgrade && (
        <UpgradeModal
          isOpen={true}
          onClose={() => setShowUpgrade(false)}
          feature="Pro Regex Patterns"
          requiredPlan="pro"
        />
      )}

    </div>
  )
}
