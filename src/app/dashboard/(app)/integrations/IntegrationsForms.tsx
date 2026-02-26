'use client'

import { useState } from 'react'

type MetaIntegration = { pixel_id: string | null; access_token: string | null } | null
type GoogleIntegration = { tag_id: string | null } | null

export default function IntegrationsForms({
  meta,
  google,
}: {
  meta: MetaIntegration
  google: GoogleIntegration
}) {
  const [metaPixelId, setMetaPixelId] = useState(meta?.pixel_id ?? '')
  const [metaAccessToken, setMetaAccessToken] = useState(meta?.access_token ?? '')
  const [googleTagId, setGoogleTagId] = useState(google?.tag_id ?? '')

  const [metaSaveMsg, setMetaSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [metaTestMsg, setMetaTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [googleSaveMsg, setGoogleSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [googleTestMsg, setGoogleTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [metaSaving, setMetaSaving] = useState(false)
  const [metaTesting, setMetaTesting] = useState(false)
  const [googleSaving, setGoogleSaving] = useState(false)
  const [googleTesting, setGoogleTesting] = useState(false)

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
        }),
      })
      const saveData = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        setMetaSaveMsg({ type: 'error', text: saveData.error ?? 'Save failed' })
        return
      }
      setMetaSaveMsg({ type: 'success', text: 'Saved.' })
      if (metaPixelId.trim() && metaAccessToken.trim()) {
        const testRes = await fetch('/api/integrations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'meta',
            pixel_id: metaPixelId.trim(),
            access_token: metaAccessToken.trim(),
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
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setGoogleSaveMsg({ type: 'success', text: 'Saved.' })
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
    setGoogleTestMsg({ type: 'error', text: 'Google test not implemented yet.' })
  }

  const metaConnected = meta && (meta.pixel_id || meta.access_token)
  const googleConnected = google && google.tag_id

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-white">Meta CAPI</h2>
          {metaConnected && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              Connected
            </span>
          )}
        </div>
        <form onSubmit={handleMetaSave} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="meta-pixel-id" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Pixel ID
            </label>
            <input
              id="meta-pixel-id"
              type="text"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="123456789012345"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
          <div>
            <label htmlFor="meta-access-token" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Access Token
            </label>
            <input
              id="meta-access-token"
              type="password"
              value={metaAccessToken}
              onChange={(e) => setMetaAccessToken(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
          {metaSaveMsg && (
            <p className={metaSaveMsg.type === 'success' ? 'text-emerald-400 text-sm' : 'text-red-400 text-sm'}>
              {metaSaveMsg.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={metaSaving}
              className="px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 disabled:opacity-50 text-sm"
            >
              {metaSaving ? 'Saving…' : 'Save & Test'}
            </button>
            <button
              type="button"
              onClick={handleMetaTest}
              disabled={metaTesting || !metaPixelId.trim() || !metaAccessToken.trim()}
              className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium hover:bg-zinc-600 disabled:opacity-50 text-sm"
            >
              {metaTesting ? 'Sending…' : 'Test only'}
            </button>
          </div>
          {metaTestMsg && (
            <p className={metaTestMsg.type === 'success' ? 'text-emerald-400 text-sm' : 'text-red-400 text-sm'}>
              {metaTestMsg.text}
            </p>
          )}
        </form>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-white">Google Enhanced Conversions</h2>
          {googleConnected && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              Connected
            </span>
          )}
        </div>
        <form onSubmit={handleGoogleSave} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="google-tag-id" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Google Ads Tag ID
            </label>
            <input
              id="google-tag-id"
              type="text"
              value={googleTagId}
              onChange={(e) => setGoogleTagId(e.target.value)}
              placeholder="AW-XXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
            <p className="mt-1 text-xs text-zinc-500">Format: AW-XXXXXXXXX</p>
          </div>
          {googleSaveMsg && (
            <p className={googleSaveMsg.type === 'success' ? 'text-emerald-400 text-sm' : 'text-red-400 text-sm'}>
              {googleSaveMsg.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={googleSaving}
              className="px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 disabled:opacity-50 text-sm"
            >
              {googleSaving ? 'Saving…' : 'Save & Test'}
            </button>
            <button
              type="button"
              onClick={handleGoogleTest}
              disabled={googleTesting}
              className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium hover:bg-zinc-600 disabled:opacity-50 text-sm"
            >
              Test only
            </button>
          </div>
          {googleTestMsg && (
            <p className={googleTestMsg.type === 'success' ? 'text-emerald-400 text-sm' : 'text-red-400 text-sm'}>
              {googleTestMsg.text}
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
