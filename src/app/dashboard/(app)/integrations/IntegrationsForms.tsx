'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CopyButton from '../setup/CopyButton'

type MetaIntegration = { pixel_id: string | null; has_access_token: boolean; meta_test_event_code?: string | null } | null
type GoogleIntegration = { tag_id: string | null; conversion_label?: string | null } | null
type PixelTokenIntegration = { pixel_id: string | null; has_access_token: boolean } | null
type Ga4Integration = { tag_id: string | null; has_access_token: boolean } | null
type TokenHealth = { status: 'idle' | 'checking' | 'valid' | 'invalid' | 'missing'; message: string }

export default function IntegrationsForms({
  meta,
  metaFbclidCount = 0,
  activePixelsCount = 0,
  google,
  tiktok,
  ga4,
}: {
  meta: MetaIntegration
  metaFbclidCount?: number
  activePixelsCount?: number
  google: GoogleIntegration
  tiktok: PixelTokenIntegration
  ga4: Ga4Integration
}) {
  const [metaPixelId, setMetaPixelId] = useState(meta?.pixel_id ?? '')
  // Never prefill stored tokens in the browser. We only accept a new token if the user pastes one.
  const [metaAccessToken, setMetaAccessToken] = useState('')
  const [metaTestEventCode, setMetaTestEventCode] = useState(meta?.meta_test_event_code ?? '')
  const [googleTagId, setGoogleTagId] = useState(google?.tag_id ?? '')
  const [googleConversionLabel, setGoogleConversionLabel] = useState(google?.conversion_label ?? '')
  const [tiktokPixelId, setTiktokPixelId] = useState(tiktok?.pixel_id ?? '')
  const [tiktokAccessToken, setTiktokAccessToken] = useState('')
  const [ga4MeasurementId, setGa4MeasurementId] = useState(ga4?.tag_id ?? '')
  const [ga4ApiSecret, setGa4ApiSecret] = useState('')

  const [metaSaveMsg, setMetaSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [metaTestMsg, setMetaTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [googleSaveMsg, setGoogleSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [googleTestMsg, setGoogleTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [tiktokSaveMsg, setTiktokSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [tiktokTestMsg, setTiktokTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ga4SaveMsg, setGa4SaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ga4TestMsg, setGa4TestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [metaTokenHealth, setMetaTokenHealth] = useState<TokenHealth>({ status: 'idle', message: '' })
  const [tiktokTokenHealth, setTiktokTokenHealth] = useState<TokenHealth>({ status: 'idle', message: '' })

  const [metaSaving, setMetaSaving] = useState(false)
  const [metaTesting, setMetaTesting] = useState(false)
  const [matchRate, setMatchRate] = useState<{
    estimated_match_rate?: number
    label?: string
    error?: string
  } | null>(null)
  const [googleSaving, setGoogleSaving] = useState(false)
  const [googleTesting, setGoogleTesting] = useState(false)
  const [tiktokSaving, setTiktokSaving] = useState(false)
  const [tiktokTesting, setTiktokTesting] = useState(false)
  const [ga4Saving, setGa4Saving] = useState(false)
  const [ga4Testing, setGa4Testing] = useState(false)

  const router = useRouter()

  async function checkSavedToken(platform: 'meta' | 'tiktok') {
    const setter = platform === 'meta' ? setMetaTokenHealth : setTiktokTokenHealth
    setter({ status: 'checking', message: 'Checking saved token...' })
    try {
      const res = await fetch('/api/integrations/token-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setter({ status: 'invalid', message: data.error ?? 'Token check failed' })
        return
      }
      const status = data.status === 'valid' || data.status === 'invalid' || data.status === 'missing' ? data.status : 'invalid'
      const message = typeof data.message === 'string' ? data.message : 'Token check failed'
      setter({ status, message })
    } catch {
      setter({ status: 'invalid', message: 'Token check failed' })
    }
  }

  async function handleMetaSave(e: React.FormEvent) {
    e.preventDefault()
    setMetaSaveMsg(null)
    setMetaTestMsg(null)
    setMetaSaving(true)
    try {
      const saveRes = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'meta',
          pixel_id: metaPixelId.trim() || undefined,
          access_token: metaAccessToken.trim() || undefined,
          meta_test_event_code: metaTestEventCode.trim() || undefined,
        }),
      })
      const saveData = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        setMetaSaveMsg({ type: 'error', text: saveData.error ?? 'Save failed' })
        return
      }
      setMetaSaveMsg({ type: 'success', text: 'Saved.' })
      setMetaAccessToken('')
      void checkSavedToken('meta')
      router.refresh()
      if (metaPixelId.trim() && metaAccessToken.trim()) {
        const testRes = await fetch('/api/integrations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'meta',
            pixel_id: metaPixelId.trim(),
            access_token: metaAccessToken.trim(),
            meta_test_event_code: metaTestEventCode.trim() || undefined,
          }),
        })
        const testData = await testRes.json().catch(() => ({}))
        if (testRes.ok) {
          setMetaTestMsg({ type: 'success', text: testData.message ?? 'Test event sent successfully' })
        } else {
          setMetaTestMsg({ type: 'error', text: testData.error ?? testData.details ?? 'Test failed' })
        }
      }
    } catch {
      setMetaSaveMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setMetaSaving(false)
    }
  }

  async function handleMetaTest(e: React.FormEvent) {
    e.preventDefault()
    setMetaTestMsg(null)
    if (!metaPixelId.trim() || !metaAccessToken.trim()) {
      setMetaTestMsg({ type: 'error', text: 'Enter Pixel ID and Access Token first' })
      return
    }
    setMetaTesting(true)
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'meta',
          pixel_id: metaPixelId.trim(),
          access_token: metaAccessToken.trim(),
          meta_test_event_code: metaTestEventCode.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMetaTestMsg({ type: 'success', text: data.message ?? 'Test event sent successfully' })
      } else {
        setMetaTestMsg({ type: 'error', text: data.error ?? data.details ?? 'Test failed' })
      }
    } catch {
      setMetaTestMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setMetaTesting(false)
    }
  }

  async function handleGoogleSave(e: React.FormEvent) {
    e.preventDefault()
    setGoogleSaveMsg(null)
    setGoogleTestMsg(null)
    setGoogleSaving(true)
    try {
      const res = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'google',
          tag_id: googleTagId.trim() || undefined,
          conversion_label: googleConversionLabel.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setGoogleSaveMsg({ type: 'success', text: 'Saved.' })
        router.refresh()
      } else {
        setGoogleSaveMsg({ type: 'error', text: data.error ?? 'Save failed' })
      }
    } catch {
      setGoogleSaveMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setGoogleSaving(false)
    }
  }

  async function handleGoogleTest(e: React.FormEvent) {
    e.preventDefault()
    setGoogleTestMsg(null)
    if (!googleTagId.trim() || !googleConversionLabel.trim()) {
      setGoogleTestMsg({ type: 'error', text: 'Enter Conversion ID and Conversion Label first' })
      return
    }
    setGoogleTesting(true)
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'google',
          tag_id: googleTagId.trim(),
          conversion_label: googleConversionLabel.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setGoogleTestMsg({ type: 'success', text: data.message ?? 'Test conversion sent successfully' })
      } else {
        setGoogleTestMsg({ type: 'error', text: data.error ?? data.details ?? 'Test failed' })
      }
    } catch {
      setGoogleTestMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setGoogleTesting(false)
    }
  }

  async function handleTiktokSave(e: React.FormEvent) {
    e.preventDefault()
    setTiktokSaveMsg(null)
    setTiktokTestMsg(null)
    // Reject email-like values — Pixel ID should be alphanumeric (e.g. CXXXXXXXX)
    if (tiktokPixelId.trim() && tiktokPixelId.includes('@')) {
      setTiktokSaveMsg({ type: 'error', text: 'Please enter your TikTok Pixel ID from Events Manager (e.g. CXXXXXXXX), not your email.' })
      return
    }
    setTiktokSaving(true)
    try {
      const saveRes = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'tiktok',
          pixel_id: tiktokPixelId.trim() || null,
          access_token: tiktokAccessToken.trim() || undefined,
        }),
      })
      const saveData = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        setTiktokSaveMsg({ type: 'error', text: saveData.error ?? 'Save failed' })
        return
      }
      setTiktokSaveMsg({ type: 'success', text: 'Saved.' })
      setTiktokAccessToken('')
      void checkSavedToken('tiktok')
      router.refresh()
      if (tiktokPixelId.trim() && tiktokAccessToken.trim()) {
        const testRes = await fetch('/api/integrations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'tiktok',
            pixel_id: tiktokPixelId.trim(),
            access_token: tiktokAccessToken.trim(),
          }),
        })
        const testData = await testRes.json().catch(() => ({}))
        if (testRes.ok) {
          setTiktokTestMsg({ type: 'success', text: testData.message ?? 'Test event sent successfully' })
        } else {
          setTiktokTestMsg({ type: 'error', text: testData.error ?? testData.details ?? 'Test failed' })
        }
      }
    } catch {
      setTiktokSaveMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setTiktokSaving(false)
    }
  }

  async function handleTiktokTest(e: React.FormEvent) {
    e.preventDefault()
    setTiktokTestMsg(null)
    if (!tiktokPixelId.trim() || !tiktokAccessToken.trim()) {
      setTiktokTestMsg({ type: 'error', text: 'Enter Pixel ID and Access Token first' })
      return
    }
    setTiktokTesting(true)
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'tiktok',
          pixel_id: tiktokPixelId.trim(),
          access_token: tiktokAccessToken.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setTiktokTestMsg({ type: 'success', text: data.message ?? 'Test event sent successfully' })
      } else {
        setTiktokTestMsg({ type: 'error', text: data.error ?? data.details ?? 'Test failed' })
      }
    } catch {
      setTiktokTestMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setTiktokTesting(false)
    }
  }

  async function handleGa4Save(e: React.FormEvent) {
    e.preventDefault()
    setGa4SaveMsg(null)
    setGa4TestMsg(null)
    setGa4Saving(true)
    try {
      const saveRes = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'ga4',
          ga4_measurement_id: ga4MeasurementId.trim() || undefined,
          ga4_api_secret: ga4ApiSecret.trim() || undefined,
        }),
      })
      const saveData = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        setGa4SaveMsg({ type: 'error', text: saveData.error ?? 'Save failed' })
        return
      }
      setGa4SaveMsg({ type: 'success', text: 'Saved.' })
      setGa4ApiSecret('')
      router.refresh()
      if (ga4MeasurementId.trim() && ga4ApiSecret.trim()) {
        const testRes = await fetch('/api/integrations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'ga4',
            tag_id: ga4MeasurementId.trim(),
            access_token: ga4ApiSecret.trim(),
          }),
        })
        const testData = await testRes.json().catch(() => ({}))
        if (testRes.ok) {
          setGa4TestMsg({ type: 'success', text: testData.message ?? 'Test event sent successfully' })
        } else {
          setGa4TestMsg({ type: 'error', text: testData.error ?? testData.details ?? 'Test failed' })
        }
      }
    } catch {
      setGa4SaveMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setGa4Saving(false)
    }
  }

  async function handleGa4Test(e: React.FormEvent) {
    e.preventDefault()
    setGa4TestMsg(null)
    if (!ga4MeasurementId.trim() || !ga4ApiSecret.trim()) {
      setGa4TestMsg({ type: 'error', text: 'Enter Measurement ID and API Secret first' })
      return
    }
    setGa4Testing(true)
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'ga4',
          tag_id: ga4MeasurementId.trim(),
          access_token: ga4ApiSecret.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setGa4TestMsg({ type: 'success', text: data.message ?? 'Test event sent successfully' })
      } else {
        setGa4TestMsg({ type: 'error', text: data.error ?? data.details ?? 'Test failed' })
      }
    } catch {
      setGa4TestMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setGa4Testing(false)
    }
  }

  // Sync form state when server props change (e.g. after router.refresh() or navigation)
  useEffect(() => {
    setMetaPixelId(meta?.pixel_id ?? '')
    setMetaTestEventCode(meta?.meta_test_event_code ?? '')
    setGoogleTagId(google?.tag_id ?? '')
    setGoogleConversionLabel(google?.conversion_label ?? '')
    setTiktokPixelId(tiktok?.pixel_id ?? '')
    setGa4MeasurementId(ga4?.tag_id ?? '')
  }, [meta?.pixel_id, meta?.meta_test_event_code, google?.tag_id, google?.conversion_label, tiktok?.pixel_id, ga4?.tag_id])

  useEffect(() => {
    fetch('/api/meta/match-rate')
      .then((r) => r.json())
      .then(setMatchRate)
      .catch(() => setMatchRate(null))
  }, [])

  useEffect(() => {
    if (meta?.has_access_token && (meta?.pixel_id ?? '').trim()) {
      void checkSavedToken('meta')
    }
    if (tiktok?.has_access_token && (tiktok?.pixel_id ?? '').trim()) {
      void checkSavedToken('tiktok')
    }
  }, [meta?.has_access_token, meta?.pixel_id, tiktok?.has_access_token, tiktok?.pixel_id])

  const metaConnected = meta && (meta.pixel_id || meta.has_access_token)
  const googleConnected = google && (google.tag_id || google.conversion_label)
  const tiktokConnected = tiktok && (tiktok.pixel_id || tiktok.has_access_token)
  const ga4Connected = ga4 && (ga4.tag_id || ga4.has_access_token)

  const installScript = `<script src="https://track.itshassanahmed.com/th.js?id=YOUR_API_KEY"></script>`

  return (
    <div className="space-y-8 overflow-y-auto">
      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-lg font-semibold text-[var(--dash-text)] mb-2">Add to your website</h2>
        <p className="text-sm text-[var(--dash-muted)] mb-3">
          Add it to <strong>your website</strong> head tag:
        </p>
        <div className="rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] overflow-hidden">
          <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--dash-border)]">
            <CopyButton text={installScript} />
          </div>
          <pre className="p-4 text-sm text-[var(--dash-text)] overflow-x-auto font-mono m-0">
            <code>{installScript}</code>
          </pre>
        </div>
        <p className="text-xs text-[var(--dash-muted)] mt-2">
          Replace <code className="px-1.5 py-0.5 rounded bg-[var(--dash-surface)] text-[var(--dash-text)]">YOUR_API_KEY</code> with your API key from the Setup page.
        </p>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">Meta CAPI</h2>
          {metaConnected && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)]">
              Connected
            </span>
          )}
        </div>
        <form onSubmit={handleMetaSave} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="meta-pixel-id" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              Pixel ID
            </label>
            <input
              id="meta-pixel-id"
              type="text"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="123456789012345"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
          </div>
          <div>
            <label htmlFor="meta-access-token" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              Access Token
            </label>
            <input
              id="meta-access-token"
              type="password"
              autoComplete="off"
              value={metaAccessToken}
              onChange={(e) => setMetaAccessToken(e.target.value)}
              placeholder={meta?.has_access_token ? 'Saved (paste to replace)' : '••••••••'}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] [&::-ms-reveal]:hidden"
            />
            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              Events Manager → your Pixel → Settings → Generate Access Token
            </p>
          </div>
          {metaTokenHealth.status !== 'idle' && (
            <p className={`text-xs ${metaTokenHealth.status === 'valid' ? 'text-[var(--dash-success)]' : metaTokenHealth.status === 'checking' ? 'text-[var(--dash-muted)]' : 'text-red-400'}`}>
              {metaTokenHealth.message}
            </p>
          )}
          {metaSaveMsg && (
            <p className={metaSaveMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {metaSaveMsg.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={metaSaving}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50 text-sm"
            >
              {metaSaving ? 'Saving…' : 'Save & Test'}
            </button>
            <button
              type="button"
              onClick={handleMetaTest}
              disabled={metaTesting || !metaPixelId.trim() || !metaAccessToken.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 text-sm"
            >
              {metaTesting ? 'Sending…' : 'Test only'}
            </button>
            <button
              type="button"
              onClick={() => checkSavedToken('meta')}
              disabled={metaTokenHealth.status === 'checking' || !meta?.has_access_token}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 text-sm"
            >
              {metaTokenHealth.status === 'checking' ? 'Checking…' : 'Check saved token'}
            </button>
          </div>
          {metaTestMsg && (
            <p className={metaTestMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {metaTestMsg.text}
            </p>
          )}
        </form>

        <div className="mt-4 p-3 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)]">
          <p className="text-xs text-[var(--dash-muted)]">
            <strong className="text-[var(--dash-text)]">Event Match Quality 9–10/10:</strong> Send email, phone, first_name, last_name with Purchase/Lead events. th.js auto-captures fbp, fbc, fbclid, IP, user agent and geo from IP.
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-[var(--dash-border)]">
          <h3 className="text-sm font-medium text-[var(--dash-muted)] mb-3">Meta Signal Status</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[var(--dash-success)] mt-1.5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium text-[var(--dash-text)]">fbp (Browser ID)</p>
                <p className="text-xs text-[var(--dash-muted)]">Auto-captured — unique visitor ID sent to Meta</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[var(--dash-success)] mt-1.5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium text-[var(--dash-text)]">fbc (Click Cookie)</p>
                <p className="text-xs text-[var(--dash-muted)]">Auto-captured — set when visitor clicks Meta ad</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[var(--dash-success)] mt-1.5 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium text-[var(--dash-text)]">fbclid (Ad Click ID)</p>
                <p className="text-xs text-[var(--dash-muted)]">
                  {metaFbclidCount} events confirmed from Meta ad clicks this month
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[var(--dash-success)] mt-1.5 shrink-0" aria-hidden />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--dash-text)]">Match Rate</p>
                <p className="text-xs text-[var(--dash-muted)] flex items-center gap-2 flex-wrap mt-1">
                  {matchRate?.error ? (
                    'Unable to load'
                  ) : typeof matchRate?.estimated_match_rate === 'number' ? (
                    <>
                      <span className="inline-flex h-2 w-24 rounded-full bg-[var(--dash-surface-hover)] overflow-hidden">
                        <span
                          className="block h-full bg-[var(--dash-success)] rounded-full"
                          style={{ width: `${matchRate.estimated_match_rate}%` }}
                        />
                      </span>
                      <span className="font-medium text-[var(--dash-text)]">{matchRate.estimated_match_rate}%</span>
                      <span className="text-[var(--dash-muted)]">{matchRate.label ?? ''}</span>
                    </>
                  ) : (
                    'No Meta events yet'
                  )}
                </p>
                <Link
                  href="/dashboard/data-quality"
                  className="text-xs text-[var(--dash-muted)] hover:text-[var(--dash-primary)] mt-1 inline-block"
                >
                  View full report →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--dash-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--dash-text)]">Multi-Pixel</p>
              <p className="text-xs text-[var(--dash-muted)]">Send events to multiple pixels</p>
            </div>
            <Link
              href="/dashboard/pixels"
              className="text-xs text-[var(--dash-success)] hover:text-[var(--dash-success-strong)] font-medium transition-colors"
            >
              Manage pixels →
            </Link>
          </div>
          <p className="text-xs text-[var(--dash-muted)] mt-1">
            {activePixelsCount} active pixel{activePixelsCount !== 1 ? 's' : ''} configured
          </p>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">Google Enhanced Conversions</h2>
          {googleConnected && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)]">
              Connected
            </span>
          )}
        </div>
        <form onSubmit={handleGoogleSave} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="google-tag-id" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              Conversion ID
            </label>
            <input
              id="google-tag-id"
              type="text"
              value={googleTagId}
              onChange={(e) => setGoogleTagId(e.target.value)}
              placeholder="AW-XXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--dash-muted)]">Format: AW-XXXXXXXXX</p>
          </div>
          <div>
            <label htmlFor="google-conversion-label" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              Conversion Label
            </label>
            <input
              id="google-conversion-label"
              type="text"
              value={googleConversionLabel}
              onChange={(e) => setGoogleConversionLabel(e.target.value)}
              placeholder="K0XaCLrkhbwZEIDr4aAB"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--dash-muted)]">From Google Ads → Goals → Conversions → Tag setup</p>
          </div>
          {googleSaveMsg && (
            <p className={googleSaveMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {googleSaveMsg.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={googleSaving}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50 text-sm"
            >
              {googleSaving ? 'Saving…' : 'Save & Test'}
            </button>
            <button
              type="button"
              onClick={handleGoogleTest}
              disabled={googleTesting}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 text-sm"
            >
              {googleTesting ? 'Sending…' : 'Test only'}
            </button>
          </div>
          {googleTestMsg && (
            <p className={googleTestMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {googleTestMsg.text}
            </p>
          )}
        </form>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">TikTok Events API</h2>
          {tiktokConnected && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)]">
              Connected
            </span>
          )}
        </div>
        <form onSubmit={handleTiktokSave} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="tiktok-pixel-id" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              TikTok Pixel ID
            </label>
            <input
              id="tiktok-pixel-id"
              type="text"
              autoComplete="off"
              value={tiktokPixelId}
              onChange={(e) => setTiktokPixelId(e.target.value)}
              placeholder="CXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
          </div>
          <div>
            <label htmlFor="tiktok-access-token" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              TikTok Access Token
            </label>
            <input
              id="tiktok-access-token"
              type="password"
              autoComplete="off"
              value={tiktokAccessToken}
              onChange={(e) => setTiktokAccessToken(e.target.value)}
              placeholder={tiktok?.has_access_token ? 'Saved (paste to replace)' : '••••••••'}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] [&::-ms-reveal]:hidden"
            />
            <a
              href="https://ads.tiktok.com/help/article?aid=10028"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs text-[var(--dash-muted)] hover:text-[var(--dash-muted)]"
            >
              Get your token from TikTok Events Manager → Management → Generate Access Token
            </a>
          </div>
          {tiktokTokenHealth.status !== 'idle' && (
            <p className={`text-xs ${tiktokTokenHealth.status === 'valid' ? 'text-[var(--dash-success)]' : tiktokTokenHealth.status === 'checking' ? 'text-[var(--dash-muted)]' : 'text-red-400'}`}>
              {tiktokTokenHealth.message}
            </p>
          )}
          {tiktokSaveMsg && (
            <p className={tiktokSaveMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {tiktokSaveMsg.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={tiktokSaving}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50 text-sm"
            >
              {tiktokSaving ? 'Saving…' : 'Save & Test'}
            </button>
            <button
              type="button"
              onClick={handleTiktokTest}
              disabled={tiktokTesting || !tiktokPixelId.trim() || !tiktokAccessToken.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 text-sm"
            >
              {tiktokTesting ? 'Sending…' : 'Test only'}
            </button>
            <button
              type="button"
              onClick={() => checkSavedToken('tiktok')}
              disabled={tiktokTokenHealth.status === 'checking' || !tiktok?.has_access_token}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 text-sm"
            >
              {tiktokTokenHealth.status === 'checking' ? 'Checking…' : 'Check saved token'}
            </button>
          </div>
          {tiktokTestMsg && (
            <p className={tiktokTestMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {tiktokTestMsg.text}
            </p>
          )}
        </form>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-[var(--dash-text)]">GA4 (Google Analytics 4)</h2>
          {ga4Connected && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)]">
              Connected
            </span>
          )}
        </div>
        <form onSubmit={handleGa4Save} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="ga4-measurement-id" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              GA4 Measurement ID
            </label>
            <input
              id="ga4-measurement-id"
              type="text"
              value={ga4MeasurementId}
              onChange={(e) => setGa4MeasurementId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--dash-muted)]">Format: G-XXXXXXXXXX</p>
          </div>
          <div>
            <label htmlFor="ga4-api-secret" className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">
              GA4 API Secret
            </label>
            <input
              id="ga4-api-secret"
              type="password"
              autoComplete="off"
              value={ga4ApiSecret}
              onChange={(e) => setGa4ApiSecret(e.target.value)}
              placeholder={ga4?.has_access_token ? 'Saved (paste to replace)' : '••••••••'}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] [&::-ms-reveal]:hidden"
            />
            <a
              href="https://support.google.com/analytics/answer/9539598"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs text-[var(--dash-muted)] hover:text-[var(--dash-muted)]"
            >
              Get from GA4 → Admin → Data Streams → Measurement Protocol API secrets
            </a>
          </div>
          {ga4SaveMsg && (
            <p className={ga4SaveMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {ga4SaveMsg.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={ga4Saving}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50 text-sm"
            >
              {ga4Saving ? 'Saving…' : 'Save & Test'}
            </button>
            <button
              type="button"
              onClick={handleGa4Test}
              disabled={ga4Testing || !ga4MeasurementId.trim() || !ga4ApiSecret.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 text-sm"
            >
              {ga4Testing ? 'Sending…' : 'Test only'}
            </button>
          </div>
          {ga4TestMsg && (
            <p className={ga4TestMsg.type === 'success' ? 'text-[var(--dash-success)] text-sm' : 'text-red-400 text-sm'}>
              {ga4TestMsg.text}
            </p>
          )}
        </form>
      </section>
    </div>
  )
}




