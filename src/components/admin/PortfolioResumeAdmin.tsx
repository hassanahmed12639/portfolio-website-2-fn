'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type FormState = {
  heroBadge: string
  heroTitle: string
  heroPrefix: string
  rotateWordsText: string
  contactLinksText: string
  skillsText: string
  toolsText: string
}

const emptyForm: FormState = {
  heroBadge: '',
  heroTitle: '',
  heroPrefix: '',
  rotateWordsText: '',
  contactLinksText: '',
  skillsText: '',
  toolsText: '',
}

export default function PortfolioResumeAdmin() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/portfolio-resume', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) {
      setError(data?.error || 'Failed to load resume settings')
      setLoading(false)
      return
    }

    setForm({
      heroBadge: data.hero_badge ?? '',
      heroTitle: data.hero_title ?? '',
      heroPrefix: data.hero_prefix ?? '',
      rotateWordsText: Array.isArray(data.rotate_words) ? data.rotate_words.join('\n') : '',
      contactLinksText: Array.isArray(data.contact_links)
        ? data.contact_links
            .map((item: { label?: string; href?: string }) => `${item.label ?? ''}|${item.href ?? ''}`)
            .join('\n')
        : '',
      skillsText: Array.isArray(data.skills) ? data.skills.join('\n') : '',
      toolsText: Array.isArray(data.tools) ? data.tools.join('\n') : '',
    })
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      heroBadge: form.heroBadge,
      heroTitle: form.heroTitle,
      heroPrefix: form.heroPrefix,
      rotateWords: form.rotateWordsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      contactLinks: form.contactLinksText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, href] = line.split('|')
          return { label: (label || '').trim(), href: (href || '').trim() }
        })
        .filter((link) => link.label && link.href),
      skills: form.skillsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      tools: form.toolsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }

    const res = await fetch('/api/admin/portfolio-resume', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) setError(data?.error || 'Failed to save settings')
    else setSuccess('Saved successfully')
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Resume Admin</h1>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-4">
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {success ? <p className="text-sm text-green-400">{success}</p> : null}

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <input
                value={form.heroBadge}
                onChange={(e) => setForm((s) => ({ ...s, heroBadge: e.target.value }))}
                placeholder="Hero badge"
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.heroTitle}
                onChange={(e) => setForm((s) => ({ ...s, heroTitle: e.target.value }))}
                placeholder="Hero title"
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.heroPrefix}
                onChange={(e) => setForm((s) => ({ ...s, heroPrefix: e.target.value }))}
                placeholder="Hero prefix"
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                rows={4}
                value={form.rotateWordsText}
                onChange={(e) => setForm((s) => ({ ...s, rotateWordsText: e.target.value }))}
                placeholder="Rotate words (one per line)"
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                rows={5}
                value={form.contactLinksText}
                onChange={(e) => setForm((s) => ({ ...s, contactLinksText: e.target.value }))}
                placeholder="Contact links format: Label|https://..."
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                rows={5}
                value={form.skillsText}
                onChange={(e) => setForm((s) => ({ ...s, skillsText: e.target.value }))}
                placeholder="Skills (one per line)"
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                rows={5}
                value={form.toolsText}
                onChange={(e) => setForm((s) => ({ ...s, toolsText: e.target.value }))}
                placeholder="Tools (one per line)"
                className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Resume Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
