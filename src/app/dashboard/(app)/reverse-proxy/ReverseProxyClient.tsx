'use client'

import { useState, useEffect } from 'react'

const PROXY_ROUTES = [
  { purpose: 'Meta Pixel', original: 'connect.facebook.net/fbevents.js', slug: 'fb' },
  { purpose: 'Meta CAPI', original: 'graph.facebook.com', slug: 'meta-capi' },
  { purpose: 'Google Tag', original: 'googletagmanager.com/gtm.js', slug: 'gtm' },
  { purpose: 'Google Ads', original: 'googleadservices.com', slug: 'gads' },
  { purpose: 'TrackHive', original: 'track.itshassanahmed.com/th.js', slug: 'th' },
] as const

const NGINX_CONFIG = `# Add to your nginx.conf
location /th-proxy/fb {
  proxy_pass https://connect.facebook.net;
  proxy_set_header Host connect.facebook.net;
}
location /th-proxy/meta-capi {
  proxy_pass https://graph.facebook.com;
  proxy_set_header Host graph.facebook.com;
}
location /th-proxy/gtm {
  proxy_pass https://www.googletagmanager.com;
  proxy_set_header Host www.googletagmanager.com;
}
location /th-proxy/gads {
  proxy_pass https://googleadservices.com;
  proxy_set_header Host googleadservices.com;
}
location /th-proxy/th {
  proxy_pass https://track.itshassanahmed.com;
  proxy_set_header Host track.itshassanahmed.com;
}`

const NEXTJS_CONFIG = `// Add to next.config.js rewrites
async rewrites() {
  return [
    {
      source: '/th-proxy/fb',
      destination: 'https://connect.facebook.net/en_US/fbevents.js'
    },
    {
      source: '/th-proxy/meta-capi/:path*',
      destination: 'https://graph.facebook.com/:path*'
    },
    {
      source: '/th-proxy/gtm',
      destination: 'https://www.googletagmanager.com/gtm.js'
    },
    {
      source: '/th-proxy/gads/:path*',
      destination: 'https://googleadservices.com/:path*'
    },
    {
      source: '/th-proxy/th',
      destination: 'https://track.itshassanahmed.com/th.js'
    }
  ]
}`

const STORAGE_KEY = 'trackhive_reverse_proxy'
type Stored = { enabled: boolean; domain: string }

function getStored(): Stored {
  if (typeof window === 'undefined') return { enabled: false, domain: 'theirsite.com' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Stored
      return { enabled: p.enabled ?? false, domain: p.domain || 'theirsite.com' }
    }
  } catch {}
  return { enabled: false, domain: 'theirsite.com' }
}

function CopyBtn({ text, showCheck = false }: { text: string; showCheck?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${copied && showCheck ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'}`}
    >
      {copied ? (showCheck ? '✓ Copied' : 'Copied') : 'Copy'}
    </button>
  )
}

function StepBlock({
  stepNum,
  title,
  code,
  copyText,
  domain,
  apiKey,
}: {
  stepNum: number
  title: string
  code: string
  copyText: string
  domain: string
  apiKey: string
}) {
  const domainVal = domain || 'theirsite.com'
  const apiKeyVal = apiKey || 'YOUR_API_KEY_HERE'
  const resolved = copyText
    .replace(/YOURDOMAIN\.com/g, domainVal)
    .replace(/YOUR_API_KEY_HERE/g, apiKeyVal)
  const displayCode = code
    .replace(/YOURDOMAIN\.com/g, domainVal)
    .replace(/YOUR_API_KEY_HERE/g, apiKeyVal)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">
          {stepNum}
        </span>
        <span className="text-sm font-medium text-zinc-300">{title}</span>
      </div>
      <div className="relative">
        <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 pr-24 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre">
          {displayCode}
        </pre>
        <div className="absolute top-3 right-3">
          <CopyBtn text={resolved} showCheck />
        </div>
      </div>
    </div>
  )
}

const NEXTJS_FULL_CONFIG = `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/th-proxy/fb',
        destination: 'https://connect.facebook.net/en_US/fbevents.js'
      },
      {
        source: '/th-proxy/meta-capi/:path*',
        destination: 'https://graph.facebook.com/:path*'
      },
      {
        source: '/th-proxy/gtm',
        destination: 'https://www.googletagmanager.com/gtm.js'
      },
      {
        source: '/th-proxy/th',
        destination: 'https://track.itshassanahmed.com/th.js'
      }
    ]
  }
}
module.exports = nextConfig`

const NEXTJS_SCRIPTS_BEFORE = `<!-- BEFORE (blocked by ad blockers) -->
<script src="https://connect.facebook.net/en_US/fbevents.js"></script>
<script src="https://track.itshassanahmed.com/th.js"></script>`

const HTACCESS_CONFIG = `# TrackHive Reverse Proxy
RewriteEngine On
RewriteRule ^th-proxy/fb$ https://connect.facebook.net/en_US/fbevents.js [P,L]
RewriteRule ^th-proxy/th$ https://track.itshassanahmed.com/th.js [P,L]
RewriteRule ^th-proxy/gtm$ https://www.googletagmanager.com/gtm.js [P,L]`

const GTM_HTML = `<script>
  window.TRACKHIVE_KEY = "YOUR_API_KEY_HERE";
</script>
<script>
  (function() {
    var s = document.createElement('script');
    s.src = 'https://YOURDOMAIN.com/th-proxy/th';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`

export default function ReverseProxyClient({ apiKey = '' }: { apiKey?: string }) {
  const [enabled, setEnabled] = useState(false)
  const [domain, setDomain] = useState('')
  const [saved, setSaved] = useState(false)
  const [configTab, setConfigTab] = useState<'nginx' | 'nextjs'>('nginx')
  const [guideTab, setGuideTab] = useState<'nextjs' | 'wordpress' | 'shopify' | 'gtm'>('nextjs')
  const [testResult, setTestResult] = useState<{ direct: boolean; proxy: boolean } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const s = getStored()
    setEnabled(s.enabled)
    if (s.domain) setDomain(s.domain)
  }, [])

  const save = () => {
    const payload: Stored = { enabled, domain: domain.trim() || 'theirsite.com' }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setDomain(payload.domain)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  const baseUrl = domain.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'theirsite.com'

  const runAdBlockerTest = async () => {
    setTesting(true)
    setTestResult(null)
    const directUrl = 'https://connect.facebook.net/en_US/fbevents.js'
    const proxyUrl = '/api/proxy/fb'
    let directBlocked = true
    let proxyBlocked = true
    try {
      const directRes = await fetch(directUrl, { method: 'HEAD', cache: 'no-store' })
      directBlocked = !directRes.ok
    } catch {
      directBlocked = true
    }
    try {
      const proxyRes = await fetch(proxyUrl, { method: 'HEAD', cache: 'no-store' })
      proxyBlocked = !proxyRes.ok
    } catch {
      proxyBlocked = true
    }
    setTestResult({ direct: !directBlocked, proxy: !proxyBlocked })
    setTesting(false)
  }

  return (
    <div className="space-y-8">
      {/* Section 1 — Status & Setup */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-medium text-zinc-300">Status & Setup</h2>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}
            >
              {enabled ? 'Active' : 'Inactive'}
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-zinc-400">Enable Reverse Proxy</span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled((e) => !e)}
                className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </label>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Your website domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="theirsite.com"
              className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={save}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors"
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-400">
            <p className="text-zinc-300 font-medium mb-1">What is Reverse Proxy?</p>
            <p>
              Tracking scripts loaded from facebook.com or google.com are often blocked by ad blockers.
              With reverse proxy, scripts are served from your own domain (e.g. {baseUrl}/th-proxy/...),
              so ad blockers do not block them and tracking coverage improves.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Proxy URLs */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">Proxy URLs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Original URL</th>
                <th className="px-4 py-3 font-medium">Your Proxy URL</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {PROXY_ROUTES.map((r) => {
                const proxyUrl = `https://${baseUrl}/th-proxy/${r.slug}`
                return (
                  <tr key={r.slug} className="border-b border-zinc-800/80">
                    <td className="px-4 py-3 text-zinc-300">{r.purpose}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{r.original}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{proxyUrl}</td>
                    <td className="px-4 py-3">
                      <CopyBtn text={proxyUrl} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-sm text-zinc-400 border-t border-zinc-800">
          Add these rewrites to your next.config.js OR contact your developer to set up nginx proxy rules. Full instructions are shown below.
        </p>
      </section>

      {/* Section 3 — Implementation */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setConfigTab('nginx')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${configTab === 'nginx' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Nginx Config
            </button>
            <button
              type="button"
              onClick={() => setConfigTab('nextjs')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${configTab === 'nextjs' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Next.js Config
            </button>
          </div>
          <CopyBtn text={configTab === 'nginx' ? NGINX_CONFIG : NEXTJS_CONFIG} />
        </div>
        <div className="p-4">
          <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre">
            {configTab === 'nginx' ? NGINX_CONFIG : NEXTJS_CONFIG}
          </pre>
        </div>
      </section>

      {/* Section 4 — Ad Blocker Test */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">Ad Blocker Test</h2>
        </div>
        <div className="p-4 space-y-4">
          <button
            type="button"
            onClick={runAdBlockerTest}
            disabled={testing}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-200 text-sm font-medium transition-colors"
          >
            {testing ? 'Testing…' : 'Test Ad Blocker Detection'}
          </button>
          {testResult !== null && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
              <p className="text-zinc-400 mb-2">Result:</p>
              <p className="text-zinc-300">
                Direct: {testResult.direct ? 'WORKING ✅' : 'BLOCKED ❌'} / Proxy:{' '}
                {testResult.proxy ? 'WORKING ✅' : 'BLOCKED ❌'}
              </p>
              {!testResult.direct && testResult.proxy && (
                <p className="mt-2 text-emerald-400">
                  ~100% improvement in tracking coverage when using proxy on your domain.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 5 — How to Use */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">How to Use</h2>
        </div>
        <div className="flex gap-1 p-3 border-b border-zinc-800 flex-wrap">
          {(['nextjs', 'wordpress', 'shopify', 'gtm'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setGuideTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${guideTab === tab ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {tab === 'gtm' ? 'GTM (Any Platform)' : tab === 'nextjs' ? 'Next.js' : tab === 'wordpress' ? 'WordPress' : 'Shopify'}
            </button>
          ))}
        </div>
        <div className="p-4 space-y-6">
          {guideTab === 'nextjs' && (
            <>
              <StepBlock
                stepNum={1}
                title="Add rewrites to next.config.js:"
                code={NEXTJS_FULL_CONFIG}
                copyText={NEXTJS_FULL_CONFIG}
                domain={baseUrl}
                apiKey={apiKey}
              />
              <StepBlock
                stepNum={2}
                title="Replace your script tags:"
                code={`${NEXTJS_SCRIPTS_BEFORE}

<!-- AFTER (never blocked — use your own domain) -->
<script src="https://${baseUrl}/th-proxy/fb"></script>
<script src="https://${baseUrl}/th-proxy/th"></script>`}
                copyText={`${NEXTJS_SCRIPTS_BEFORE}

<!-- AFTER (never blocked — use your own domain) -->
<script src="https://${baseUrl}/th-proxy/fb"></script>
<script src="https://${baseUrl}/th-proxy/th"></script>`}
                domain={baseUrl}
                apiKey={apiKey}
              />
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">3</span>
                <span className="text-sm text-zinc-300">Redeploy your site and test.</span>
              </div>
            </>
          )}

          {guideTab === 'wordpress' && (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">1</span>
                <span className="text-sm text-zinc-300">Install WP Rocket or Nginx Helper plugin OR use functions.php</span>
              </div>
              <StepBlock
                stepNum={2}
                title="Add this to your .htaccess file (Apache):"
                code={HTACCESS_CONFIG}
                copyText={HTACCESS_CONFIG}
                domain={baseUrl}
                apiKey={apiKey}
              />
              <StepBlock
                stepNum={3}
                title="Update your script tags in header.php or via GTM:"
                code={`<script src="https://${baseUrl}/th-proxy/fb"></script>
<script src="https://${baseUrl}/th-proxy/th"></script>`}
                copyText={`<script src="https://${baseUrl}/th-proxy/fb"></script>
<script src="https://${baseUrl}/th-proxy/th"></script>`}
                domain={baseUrl}
                apiKey={apiKey}
              />
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">4</span>
                <span className="text-sm text-zinc-300">Clear cache and test.</span>
              </div>
            </>
          )}

          {guideTab === 'shopify' && (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">1</span>
                <span className="text-sm text-zinc-300">Go to Shopify Admin → Online Store → Themes → Edit Code</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">2</span>
                <span className="text-sm text-zinc-300">Open theme.liquid, find closing &lt;/head&gt; tag</span>
              </div>
              <StepBlock
                stepNum={3}
                title="Replace existing tracking scripts:"
                code={`<!-- TrackHive via Reverse Proxy — Ad Blocker Proof -->
<script>
  window.TRACKHIVE_KEY = "${apiKey || 'YOUR_API_KEY_HERE'}";
</script>
<script src="https://${baseUrl}/th-proxy/th" async></script>`}
                copyText={`<!-- TrackHive via Reverse Proxy — Ad Blocker Proof -->
<script>
  window.TRACKHIVE_KEY = "${apiKey || 'YOUR_API_KEY_HERE'}";
</script>
<script src="https://${baseUrl}/th-proxy/th" async></script>`}
                domain={baseUrl}
                apiKey={apiKey}
              />
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">4</span>
                <span className="text-sm text-zinc-300">Add proxy rules via Shopify Hydrogen or contact developer</span>
              </div>
              <StepBlock
                stepNum={5}
                title="Alternative: Use TrackHive direct (still server-side, still bypasses iOS):"
                code={`<script>
  window.TRACKHIVE_KEY = "${apiKey || 'YOUR_API_KEY_HERE'}";
</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>`}
                copyText={`<script>
  window.TRACKHIVE_KEY = "${apiKey || 'YOUR_API_KEY_HERE'}";
</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>`}
                domain={baseUrl}
                apiKey={apiKey}
              />
            </>
          )}

          {guideTab === 'gtm' && (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">1</span>
                <span className="text-sm text-zinc-300">In GTM create a new Custom HTML tag</span>
              </div>
              <StepBlock
                stepNum={2}
                title="Paste this code:"
                code={GTM_HTML}
                copyText={GTM_HTML}
                domain={baseUrl}
                apiKey={apiKey}
              />
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">3</span>
                <span className="text-sm text-zinc-300">Set trigger to &quot;All Pages&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">4</span>
                <span className="text-sm text-zinc-300">Publish GTM container</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">5</span>
                <span className="text-sm text-zinc-300">Verify in GTM Preview mode</span>
              </div>
            </>
          )}

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-400 space-y-1">
            <p className="text-zinc-300 font-medium">Important notes for all tabs:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>Replace YOURDOMAIN.com with your actual domain shown in the Proxy URLs table above</li>
              <li>Replace YOUR_API_KEY_HERE with your API key from Setup &amp; Snippet page</li>
              <li>After setup, use the Ad Blocker Test button above to verify it is working</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
