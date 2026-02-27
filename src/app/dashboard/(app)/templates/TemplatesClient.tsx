'use client'

import { useState, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  TEMPLATES,
  CATEGORIES,
  PLATFORMS,
  TYPES,
  canAccessTemplate,
  type Template,
} from '@/lib/templates'
import { UpgradeModal } from '@/components/UpgradeModal'
import {
  Search,
  Download,
  Eye,
  Lock,
  X,
  Copy,
  FileDown,
} from 'lucide-react'

type PlanLabel = 'free' | 'trial' | 'pro' | 'agency'

const PLATFORM_LABELS: Record<string, string> = {
  meta: 'Meta',
  google: 'Google',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  ga4: 'GA4',
  linkedin: 'LinkedIn',
}

const TYPE_LABELS: Record<string, string> = {
  'gtm-web': 'GTM Web',
  'gtm-tpl': 'GTM .tpl',
  sgtm: 'sGTM',
  shopify: 'Shopify',
  wordpress: 'WordPress',
  webflow: 'Webflow',
  html: 'HTML',
}

export default function TemplatesClient({
  userPlan,
}: {
  userPlan: PlanLabel
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [platformFilter, setPlatformFilter] = useState<string>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [planFilter, setPlanFilter] = useState<string>('All')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean
    templateName: string
    requiredPlan: string
  }>({ open: false, templateName: '', requiredPlan: '' })
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = category === 'All' || t.category === category
      const matchType = typeFilter === 'All' || t.type === typeFilter
      const matchPlatform =
        platformFilter === 'All' || t.platform.includes(platformFilter)
      const matchDifficulty =
        difficultyFilter === 'All' || t.difficulty === difficultyFilter
      const matchPlan = planFilter === 'All' || t.requiredPlan === planFilter
      return (
        matchSearch &&
        matchCategory &&
        matchType &&
        matchPlatform &&
        matchDifficulty &&
        matchPlan
      )
    })
  }, [
    search,
    category,
    typeFilter,
    platformFilter,
    difficultyFilter,
    planFilter,
  ])

  const stats = useMemo(() => {
    const free = TEMPLATES.filter((t) => t.requiredPlan === 'free').length
    const pro = TEMPLATES.filter((t) => t.requiredPlan === 'pro').length
    const agency = TEMPLATES.filter((t) => t.requiredPlan === 'agency').length
    return { total: TEMPLATES.length, free, pro, agency }
  }, [])

  async function handleDownload(t: Template) {
    const canAccess = canAccessTemplate(userPlan, t.requiredPlan)
    if (!canAccess) {
      setUpgradeModal({
        open: true,
        templateName: t.name,
        requiredPlan: t.requiredPlan.toUpperCase(),
      })
      return
    }
    try {
      const res = await fetch(`/api/templates/download?templateId=${encodeURIComponent(t.id)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 403) {
          setUpgradeModal({
            open: true,
            templateName: t.name,
            requiredPlan: t.requiredPlan.toUpperCase(),
          })
          return
        }
        alert(data.message || data.error || 'Download failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = t.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed')
    }
  }

  function handleCopyCode() {
    if (!previewTemplate) return
    navigator.clipboard.writeText(previewTemplate.previewCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadCode() {
    if (!previewTemplate) return
    const blob = new Blob([previewTemplate.previewCode], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = previewTemplate.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">
          GTM & sGTM Template Library
        </h1>
        <p className="text-zinc-400 text-sm mb-4">
          80+ ready-to-use templates. Download, import, and start tracking in
          minutes.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-zinc-500">
            <strong className="text-zinc-300">{stats.total}</strong> templates
            available
          </span>
          <span className="text-zinc-500">
            <strong className="text-emerald-400">{stats.free}</strong> Free
          </span>
          <span className="text-zinc-500">
            <strong className="text-amber-400">{stats.pro}</strong> Pro
          </span>
          <span className="text-zinc-500">
            <strong className="text-violet-400">{stats.agency}</strong> Agency
          </span>
        </div>
      </header>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-sm mr-1 self-center">Category:</span>
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === c
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-sm mr-1 self-center">Type:</span>
          {['All', ...TYPES.map((t) => t.value)].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setTypeFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === v
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {TYPE_LABELS[v] || v}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-sm mr-1 self-center">
            Platform:
          </span>
          {['All', ...PLATFORMS].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                platformFilter === p
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {PLATFORM_LABELS[p] || p}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-sm mr-1 self-center">
            Difficulty:
          </span>
          {['All', 'beginner', 'intermediate', 'advanced'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                difficultyFilter === d
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-sm mr-1 self-center">Plan:</span>
          {['All', 'free', 'pro', 'agency'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                planFilter === p
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const locked = !canAccessTemplate(userPlan, t.requiredPlan)
          return (
            <div
              key={t.id}
              className={`relative rounded-xl border bg-zinc-900/80 overflow-hidden ${
                locked
                  ? 'border-zinc-700 opacity-90'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {locked && (
                <div
                  className="absolute inset-0 bg-zinc-950/60 z-10 flex items-center justify-center"
                  aria-hidden
                >
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
              )}
              <div className="p-4">
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 mb-2"
                  style={{
                    backgroundColor:
                      t.category === 'E-commerce'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : t.category === 'Lead Generation'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : t.category === 'Engagement'
                            ? 'rgba(168, 85, 247, 0.2)'
                            : t.category === 'Server GTM'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : undefined,
                  }}
                >
                  {t.category}
                </span>
                <h3 className="font-semibold text-white mb-1">{t.name}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                  {t.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.platform.slice(0, 4).map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400"
                    >
                      {PLATFORM_LABELS[p] || p}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      t.difficulty === 'beginner'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : t.difficulty === 'intermediate'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {t.difficulty}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      t.requiredPlan === 'free'
                        ? 'bg-zinc-600 text-zinc-200'
                        : t.requiredPlan === 'pro'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-violet-500/20 text-violet-400'
                    }`}
                  >
                    {t.requiredPlan.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(t)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Code
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(t)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-zinc-500 py-12">
          No templates match your filters. Try adjusting search or filters.
        </p>
      )}

      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {previewTemplate.name}
                </h2>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {previewTemplate.description}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Plan: {previewTemplate.requiredPlan.toUpperCase()} • File:{' '}
                  {previewTemplate.fileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="rounded-lg overflow-hidden border border-zinc-700">
                <SyntaxHighlighter
                  language="javascript"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    fontSize: '13px',
                    background: '#18181b',
                    padding: '1rem',
                  }}
                  showLineNumbers
                  wrapLongLines
                >
                  {previewTemplate.previewCode}
                </SyntaxHighlighter>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-700 flex gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                type="button"
                onClick={handleDownloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                Download File
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="ml-auto px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() =>
          setUpgradeModal((prev) => ({ ...prev, open: false }))
        }
        featureName={upgradeModal.templateName}
        requiredPlan={upgradeModal.requiredPlan}
      />
    </div>
  )
}
