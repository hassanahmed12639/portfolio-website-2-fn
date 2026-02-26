'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import Link from 'next/link'

const NEON = '#AAFF00'

const PLATFORMS = [
  { id: 'meta', label: 'Meta (Facebook/Instagram)' },
  { id: 'google', label: 'Google Ads' },
  { id: 'tiktok', label: 'TikTok Ads' },
  { id: 'linkedin', label: 'LinkedIn Ads' },
  { id: 'snapchat', label: 'Snapchat Ads' },
]

const BUSINESS_TYPES = ['Lead Generation', 'Ecommerce', 'SaaS'] as const
const TRAFFIC_VOLUMES = ['Low (<5K)', 'Medium (5K–50K)', 'High (50K+)'] as const
const AD_BUDGETS = ['Small', 'Medium', 'Large'] as const
const FUNNEL_STAGES = ['Cold', 'Warm', 'Hot', 'Full Funnel'] as const
const CONVERSION_TYPES = ['Leads', 'Purchases', 'Signups'] as const
const PIXEL_SIZES = ['Small (<1K events)', 'Medium (1K–10K)', 'Large (10K+)'] as const
const CAMPAIGN_GOALS = ['Scale', 'Profitability', 'Testing'] as const

const DATA_SOURCES = [
  'Website visitors', 'Page engagement', 'Video views', 'Customer list (email/phone)',
  'App users', 'Add to cart', 'Initiate checkout', 'Purchasers', 'Leads',
]

const INDUSTRIES = [
  'E-commerce', 'SaaS', 'Finance', 'Health & Fitness', 'Education', 'Real Estate',
  'Agency', 'D2C', 'Lead Gen', 'Local Business', 'Other'
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Brazil', 'Mexico', 'India', 'UAE', 'Singapore'
]

export type FormState = {
  platforms: string[]
  businessType: string
  industry: string
  website: string
  metaInstagramUrl: string
  metaFacebookUrl: string
  googleBusinessUrl: string
  tiktokPageUrl: string
  linkedinPageUrl: string
  snapchatPageUrl: string
  targetCountry: string
  monthlyTraffic: string
  monthlyBudget: string
  funnelStage: string
  conversionType: string
  averageOrderValue: string
  dataSources: string[]
  pixelSize: string
  campaignGoal: string
  monthlyVisitorsOverride: string
}

export type SavedStrategy = {
  id: string
  name: string
  form: FormState
  report: Report
  at: string
}

export type Report = {
  overview: {
    summary: string
    dataStrengthScore: string
    pixelReadiness: string
    recommendedAudienceTypes: string[]
    funnelCompletenessScore: string
  }
  customAudiences: {
    websiteAudiences: { name: string; whenToUse: string; idealDuration: string; minSize: string }[]
    engagementAudiences: { name: string; whenToUse: string; idealDuration: string }[]
    customerList: string[]
    exclusionLogic: string[]
    minSizeNote: string
    tooSmallNote: string
  }
  lookalike: {
    lalStrategy: { range: string; useCase: string }[]
    whichToUse: { dataSize: string; recommendation: string }[]
    valueBasedLal: string
    stackingStrategy: string
    testingPlan: string
  }
  retargetingFunnel: {
    hot: { audiences: string[]; messaging: string; offer: string; creative: string }
    warm: { audiences: string[]; messaging: string; offer: string; creative: string }
    cold: { audiences: string[]; messaging: string; offer: string; creative: string }
  }
  platformSetup: {
    meta: string[]
    google: string[]
    tiktok: string[]
    linkedin: string[]
    snapchat: string[]
  }
  budgetAllocation: {
    coldPct: string
    warmPct: string
    hotPct: string
    minBudgetPerAudience: string
    scalingRecommendations: string
  }
  scalingStrategy: {
    expandLal: string
    addAudiences: string
    creativeRefresh: string
    frequencyMonitoring: string
  }
  advancedInsights: {
    overlapWarning: string
    frequencyRisk: string
    saturationSignals: string
    hiddenOpportunities: string
    mistakesToAvoid: string[]
    proTips: string[]
  }
}

const defaultForm: FormState = {
  platforms: [],
  businessType: '',
  industry: '',
  website: '',
  metaInstagramUrl: '',
  metaFacebookUrl: '',
  googleBusinessUrl: '',
  tiktokPageUrl: '',
  linkedinPageUrl: '',
  snapchatPageUrl: '',
  targetCountry: '',
  monthlyTraffic: '',
  monthlyBudget: '',
  funnelStage: '',
  conversionType: '',
  averageOrderValue: '',
  dataSources: [],
  pixelSize: '',
  campaignGoal: '',
  monthlyVisitorsOverride: '',
}

const SAVED_STRATEGIES_KEY = 'custom-audience-builder-strategies'
const MAX_SAVED_STRATEGIES = 5

function getMonthlyVisitorsFromTraffic(traffic: string, override: string): number {
  if (override.trim()) {
    const n = parseInt(override.replace(/\D/g, ''), 10)
    return isNaN(n) ? 0 : n
  }
  if (traffic.startsWith('Low')) return 2500
  if (traffic.startsWith('Medium')) return 25000
  if (traffic.startsWith('High')) return 100000
  return 25000
}

function estimateAudienceSizes(form: FormState): { label: string; estimated: string; note: string }[] {
  const monthly = getMonthlyVisitorsFromTraffic(form.monthlyTraffic, form.monthlyVisitorsOverride)
  if (monthly <= 0) return []
  const visitors30 = Math.round(monthly * 0.9)
  const visitors7 = Math.round(monthly * 0.25)
  const visitors90 = Math.round(monthly * 2.2)
  const atcRate = 0.08
  const checkoutRate = 0.45
  const purchaseRate = 0.65
  const atc7 = Math.round(visitors7 * atcRate)
  const checkout7 = Math.round(atc7 * checkoutRate)
  const purchasers7 = Math.round(checkout7 * purchaseRate)
  return [
    { label: '30d website visitors', estimated: visitors30.toLocaleString(), note: 'LAL seed / retargeting' },
    { label: '7d website visitors', estimated: visitors7.toLocaleString(), note: 'Hot retargeting' },
    { label: '90d website visitors', estimated: visitors90.toLocaleString(), note: 'Cold retargeting' },
    { label: '7d add to cart (est.)', estimated: atc7.toLocaleString(), note: '~8% of 7d visitors' },
    { label: '7d checkout (est.)', estimated: checkout7.toLocaleString(), note: '~45% of ATC' },
    { label: '7d purchasers (est.)', estimated: purchasers7.toLocaleString(), note: 'Exclude from ads' },
  ]
}

function getDataQualityChecklist(form: FormState): { item: string; status: 'yes' | 'no' | 'partial'; note: string }[] {
  const hasPixel = form.pixelSize.length > 0
  const hasKeyEvents = form.dataSources.some((d) => ['Add to cart', 'Initiate checkout', 'Purchasers', 'Leads'].includes(d))
  const hasExclusion = form.dataSources.includes('Purchasers') || form.dataSources.includes('Leads')
  const hasList = form.dataSources.includes('Customer list (email/phone)')
  const hasVideo = form.dataSources.includes('Video views')
  return [
    { item: 'Pixel / events source', status: hasPixel ? 'yes' : 'no', note: hasPixel ? 'Data size selected' : 'Select pixel size' },
    { item: 'Key events (ATC, checkout, purchase)', status: hasKeyEvents ? 'yes' : 'no', note: hasKeyEvents ? 'At least one key event' : 'Add events for better LAL' },
    { item: 'Purchase exclusion', status: hasExclusion ? 'yes' : 'no', note: hasExclusion ? 'Exclude purchasers in ad sets' : 'Critical for efficiency' },
    { item: 'Customer list (optional)', status: hasList ? 'yes' : 'partial', note: hasList ? 'Use for LAL seed / exclusion' : 'Upload for exclusion/LAL' },
    { item: 'Video view audiences', status: hasVideo ? 'yes' : 'partial', note: hasVideo ? 'Video % audiences available' : 'Add for engagement LAL' },
  ]
}

function generateReport(f: FormState): Report {
  const platforms = f.platforms.length ? f.platforms : ['Meta']
  const biz = f.businessType || 'Ecommerce'
  const ind = f.industry || 'Your industry'
  const website = f.website?.trim() || ''
  const country = f.targetCountry || 'your market'
  const traffic = f.monthlyTraffic || 'Medium (5K–50K)'
  const budget = f.monthlyBudget || 'Medium'
  const funnel = f.funnelStage || 'Full Funnel'
  const conv = f.conversionType || 'Purchases'
  const pixel = f.pixelSize || 'Medium (1K–10K)'
  const goal = f.campaignGoal || 'Scale'
  const hasPurchasers = f.dataSources.includes('Purchasers')
  const hasCart = f.dataSources.includes('Add to cart')
  const hasLeads = f.dataSources.includes('Leads')
  const hasCustomerList = f.dataSources.includes('Customer list (email/phone)')
  const hasVideo = f.dataSources.includes('Video views')
  const isEcom = biz === 'Ecommerce'
  const isLeadGen = biz === 'Lead Generation'
  const smallData = pixel.startsWith('Small')
  const largeData = pixel.startsWith('Large')
  const dataStrength = smallData ? 'Weak' : largeData ? 'Strong' : 'Moderate'
  const pixelReadiness = smallData ? 'Needs more events before heavy LAL use' : largeData ? 'Ready for LAL stacking and value-based' : 'Good for 1–3% LAL and retargeting'

  return {
    overview: {
      summary: `For ${ind}${website ? ` (${website})` : ''} in ${country}, with ${traffic} monthly traffic and ${budget} budget, focus on ${funnel.toLowerCase()} audiences. Your conversion goal (${conv}) and data sources support a ${dataStrength.toLowerCase()} data position. Prioritize ${platforms.slice(0, 2).join(' and ')} first.`,
      dataStrengthScore: dataStrength,
      pixelReadiness,
      recommendedAudienceTypes: hasPurchasers
        ? ['Custom audiences from purchasers (exclude)', '1–3% LAL from purchasers', 'Retargeting by recency']
        : hasLeads && isLeadGen
          ? ['Custom audiences from leads (exclude converters)', '1–3% LAL from leads', 'Retargeting by recency']
          : hasCart
            ? ['Add to cart & checkout retargeting', '1% LAL from cart if 500+', 'Website visitor audiences 7–90 days']
            : ['Website visitors 30/60/90 days', 'Engagement audiences', 'Build toward cart/checkout or lead events'],
      funnelCompletenessScore: hasPurchasers && hasCart ? 'High' : (hasLeads && isLeadGen) ? 'High' : hasCart ? 'Medium' : 'Building — add key events.',
    },
    customAudiences: {
      websiteAudiences: [
        { name: 'All visitors (30, 60, 90 days)', whenToUse: 'Top-of-funnel retargeting and LAL seed.', idealDuration: '30d hot; 60–90d nurture.', minSize: 'Min 1K Meta; 1K+ Google.' },
        { name: 'Product viewers (7, 14, 30 days)', whenToUse: 'Consideration; product-focused creative.', idealDuration: '7–14d urgency; 30d reminder.', minSize: '500+.' },
        { name: 'Add to cart (3, 7, 14 days)', whenToUse: 'High intent; strong offer.', idealDuration: '3d strongest; 7–14d second touch.', minSize: '300+; exclude purchasers.' },
        { name: 'Checkout initiated', whenToUse: 'Highest intent; discount or guarantee.', idealDuration: '3–7 days.', minSize: '100+; exclude purchasers.' },
        { name: 'Purchasers (exclude)', whenToUse: 'Exclude from prospecting and retargeting.', idealDuration: 'Permanent or 180d+.', minSize: 'N/A.' },
      ],
      engagementAudiences: [
        { name: 'Video viewers (25%, 50%, 75%, 95%)', whenToUse: 'Engaged; nurture with next-step creative.', idealDuration: 'Layer 7–30d.' },
        { name: 'Page engagers (7, 30, 90 days)', whenToUse: 'Broader retargeting; social proof.', idealDuration: '30d warm; 90d cold.' },
        { name: 'Instagram engagers', whenToUse: 'Meta-only; cross-sell.', idealDuration: '30–90 days.' },
        { name: 'Ad engagers', whenToUse: 'Engaged but didn’t convert; second angle.', idealDuration: '7–14 days.' },
      ],
      customerList: [
        'Segment email list by value for LAL seed.',
        'Use high-value customers for value-based LAL (Meta) when list 1K+.',
        'Exclude recent converters (e.g. 30d) from cold and retargeting.',
      ],
      exclusionLogic: [
        'Exclude purchasers from all prospecting and retargeting.',
        'Exclude recent converters (7–30d) from retargeting.',
        'Exclude overlap: segment by recency.',
      ],
      minSizeNote: 'Meta: 1K+ custom; 500+ narrow. Google: 1K+ remarketing. TikTok/LinkedIn: 1K+.',
      tooSmallNote: 'Below ~300 (Meta) or 1K (Google), broaden window or merge segments.',
    },
    lookalike: {
      lalStrategy: [
        { range: '0–1%', useCase: 'Highest quality; best for conversions.' },
        { range: '1–3%', useCase: 'Balanced scaling; cold prospecting.' },
        { range: '3–5%', useCase: 'Expansion; when 1–3% saturated.' },
        { range: '5–10%', useCase: 'Broad reach; lower efficiency.' },
      ],
      whichToUse: [
        { dataSize: 'Small (<1K)', recommendation: '1% only; best seed (purchasers > cart > visitors).' },
        { dataSize: 'Medium (1K–10K)', recommendation: '1–3%; test 1% first.' },
        { dataSize: 'Large (10K+)', recommendation: '1–5% stacking; value-based LAL if ecom.' },
      ],
      valueBasedLal: isEcom && hasPurchasers
        ? 'Use value-based LAL (Meta) with 1K+ purchasers. Stack with 1% standard LAL.'
        : 'Value-based LAL needs 1K+ purchasers with value. Focus on standard LAL until then.',
      stackingStrategy: 'Run 1% and 3% in separate ad sets. Exclude lower % from higher % where possible.',
      testingPlan: 'Start with 1 LAL seed. Test 2–3 LALs max; split budget 50/50 or 40/40/20. Wait 50+ conversions per ad set.',
    },
    retargetingFunnel: {
      hot: { audiences: ['Add to cart 0–7d', 'Checkout initiated'], messaging: 'Strong offer, urgency, guarantee.', offer: 'Discount, free shipping.', creative: 'Product-focused, testimonial.' },
      warm: { audiences: ['Page visitors 7–30d', 'Video 50%+', 'Engagers 7–30d'], messaging: 'Social proof, benefits.', offer: 'Lead magnet, demo.', creative: 'UGC, how-it-works.' },
      cold: { audiences: ['Visitors 30–90d', 'Light engagers 30–90d'], messaging: 'Soft reminder, brand recall.', offer: 'Newsletter, content.', creative: 'Brand story, recap.' },
    },
    platformSetup: {
      meta: ['Events Manager → Custom Audiences → Website (events + windows).', 'Create Purchase exclusion; use in ad set.', 'LAL: Audiences → Lookalike → source, country, 1% then 3%.', 'Budget: 50–70% cold, 20–30% warm, 10–20% hot.'],
      google: ['Audience manager → Remarketing lists.', 'Customer Match for list; Similar audiences for expansion.', 'YouTube: video view lists 25%, 50%.'],
      tiktok: ['Events Manager → Custom Audiences by event.', 'Lookalike from pixel or file; 1% first.', 'Engagement audiences for retargeting.'],
      linkedin: ['Matched Audiences → Website retargeting (Insight Tag).', 'Upload list for Account/Contact.', 'Combine with job title/industry.'],
      snapchat: ['Snap Pixel → Audiences from events.', 'Engagement audiences for retargeting.', 'Lookalike from audience or upload.'],
    },
    budgetAllocation: {
      coldPct: '50–70%',
      warmPct: '20–30%',
      hotPct: '10–20%',
      minBudgetPerAudience: 'Meta/Google ~$15–25/day per ad set. TikTok/LinkedIn ~$20–30/day.',
      scalingRecommendations: goal === 'Scale' ? 'Increase cold/LAL once ROAS holds.' : goal === 'Profitability' ? 'Shift toward hot/warm.' : 'Keep split even for testing.',
    },
    scalingStrategy: {
      expandLal: 'When 1% profitable and frequency <3, add 3%. Refresh creative before expanding %.',
      addAudiences: 'Add when saturated (frequency 4+) or new events. One new audience per campaign.',
      creativeRefresh: 'Hot/warm every 2–4 weeks; cold 4–6 weeks.',
      frequencyMonitoring: 'Aim <4 retargeting; <3 cold. Cap 3–5/day for hot.',
    },
    advancedInsights: {
      overlapWarning: '30d visitors and 7d cart overlap. Exclude lower-funnel or use frequency cap.',
      frequencyRisk: 'Hot audiences: cap 3–5/day. Watch fatigue on warm/cold.',
      saturationSignals: 'CPM rising, CTR dropping, 4+ weeks same creative.',
      hiddenOpportunities: 'Value-based LAL; engagement LAL (video 75%+); exclude 1% from 3% LAL.',
      mistakesToAvoid: ['LAL without excluding converters.', 'Too many small audiences.', 'Ignoring frequency.', 'Same creative for cold and hot.'],
      proTips: ['Stack 1% + 3% LAL, separate ad sets.', 'Exclude 30d purchasers from retargeting.', 'Customer list as exclusion in prospecting.'],
    },
  }
}

function SectionCard({
  title,
  icon,
  children,
  onCopy,
  onRegenerate,
  theme,
}: {
  title: string
  icon: string
  children: React.ReactNode
  onCopy?: () => void
  onRegenerate?: () => void
  theme: { card: string; border: string; text: string; muted: string }
}) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-xl border p-4 sm:p-5 mb-4" style={{ background: theme.card, borderColor: theme.border }}>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <span className="text-lg" aria-hidden>{icon}</span>
        <h3 className="font-semibold text-base" style={{ color: theme.text }}>{title}</h3>
        <div className="flex items-center gap-2 ml-auto">
          {onRegenerate && (
            <button type="button" onClick={onRegenerate} className="text-xs px-2 py-1 rounded border transition-colors hover:border-[#AAFF00] hover:text-[#AAFF00]" style={{ borderColor: theme.border, color: theme.muted }}>Regenerate</button>
          )}
          {onCopy && (
            <button type="button" onClick={() => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-xs px-2 py-1 rounded border transition-colors hover:border-[#AAFF00] hover:text-[#AAFF00]" style={{ borderColor: theme.border, color: theme.muted }}>{copied ? 'Copied' : 'Copy'}</button>
          )}
        </div>
      </div>
      <div className="text-sm space-y-2" style={{ color: theme.text }}>{children}</div>
    </div>
  )
}

function MultiSelect({
  options,
  selected,
  onChange,
  theme,
  label,
}: {
  options: { id: string; label: string }[] | readonly string[]
  selected: string[]
  onChange: (v: string[]) => void
  theme: { border: string; text: string; muted: string; inputBg: string }
  label: string
}) {
  const list = options.map((o) => (typeof o === 'string' ? { id: o, label: o } : o))
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  return (
    <div>
      <span className="block text-xs uppercase tracking-wider mb-2" style={{ color: theme.muted }}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {list.map((o) => (
          <button key={o.id} type="button" onClick={() => toggle(o.id)} className="px-3 py-1.5 rounded-lg text-sm border transition-colors"
            style={{ background: selected.includes(o.id) ? NEON : theme.inputBg, borderColor: selected.includes(o.id) ? NEON : theme.border, color: selected.includes(o.id) ? '#0a0a0a' : theme.text }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CustomAudienceBuilder() {
  const { isDarkMode } = useTheme()
  const theme = {
    bg: isDarkMode ? '#0a0a0a' : '#ffffff',
    card: isDarkMode ? '#111111' : '#f5f5f5',
    border: isDarkMode ? '#1e1e1e' : '#e5e5e5',
    text: isDarkMode ? '#fff' : '#0F0F0F',
    muted: isDarkMode ? '#888' : '#555',
    inputBg: isDarkMode ? '#0a0a0a' : '#fff',
  }

  const [form, setForm] = useState<FormState>(defaultForm)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [leadEmail, setLeadEmail] = useState({ name: '', email: '' })
  const [showEstimator, setShowEstimator] = useState(false)
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([])
  const [compareStrategyId, setCompareStrategyId] = useState<string | null>(null)

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleGenerate = () => {
    if (!form.website.trim()) {
      alert('Please enter your website URL (required).')
      return
    }
    if (form.platforms.includes('meta')) {
      if (!form.metaInstagramUrl.trim()) {
        alert('Please enter your Instagram page URL (required when Meta is selected).')
        return
      }
      if (!form.metaFacebookUrl.trim()) {
        alert('Please enter your Facebook page URL (required when Meta is selected).')
        return
      }
    }
    if (form.platforms.includes('tiktok') && !form.tiktokPageUrl.trim()) {
      alert('Please enter your TikTok page URL (required when TikTok is selected).')
      return
    }
    if (form.platforms.includes('linkedin') && !form.linkedinPageUrl.trim()) {
      alert('Please enter your LinkedIn page URL (required when LinkedIn is selected).')
      return
    }
    if (form.platforms.includes('snapchat') && !form.snapchatPageUrl.trim()) {
      alert('Please enter your Snapchat page URL (required when Snapchat is selected).')
      return
    }
    setLoading(true)
    setReport(null)
    setTimeout(() => {
      setReport(generateReport(form))
      setLoading(false)
      setUnlocked(false)
    }, 1200)
  }

  const unlockReport = () => {
    if (leadEmail.name.trim() && leadEmail.email.trim()) {
      setUnlocked(true)
    }
  }

  const copySection = (text: string) => { navigator.clipboard.writeText(text) }

  const copyAll = () => {
    if (!report) return
    navigator.clipboard.writeText([
      JSON.stringify(report.overview, null, 2),
      JSON.stringify(report.customAudiences, null, 2),
      JSON.stringify(report.lookalike, null, 2),
      JSON.stringify(report.retargetingFunnel, null, 2),
      JSON.stringify(report.platformSetup, null, 2),
      JSON.stringify(report.budgetAllocation, null, 2),
      JSON.stringify(report.scalingStrategy, null, 2),
      JSON.stringify(report.advancedInsights, null, 2),
    ].join('\n\n---\n\n'))
  }

  const saveReport = () => {
    if (!report) return
    try {
      localStorage.setItem('custom-audience-builder-report', JSON.stringify({ form, report, at: new Date().toISOString() }))
      alert('Report saved to this device.')
    } catch { alert('Could not save.') }
  }

  const [shareCopied, setShareCopied] = useState(false)
  const shareLink = () => {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_STRATEGIES_KEY)
      if (raw) setSavedStrategies((JSON.parse(raw) as SavedStrategy[]).slice(0, MAX_SAVED_STRATEGIES) || [])
    } catch { setSavedStrategies([]) }
  }, [])

  const regenerateSection = useCallback((key: keyof Report) => {
    if (!report) return
    setTimeout(() => {
      const next = generateReport(form)
      setReport((prev) => (prev ? { ...prev, [key]: next[key] } : null))
    }, 400)
  }, [form, report])

  const saveReportAs = () => {
    if (!report) return
    const name = window.prompt('Name this strategy')
    if (!name?.trim()) return
    const newSaved: SavedStrategy = { id: `s${Date.now()}`, name: name.trim(), form: { ...form }, report: JSON.parse(JSON.stringify(report)), at: new Date().toISOString() }
    const next = [newSaved, ...savedStrategies].slice(0, MAX_SAVED_STRATEGIES)
    setSavedStrategies(next)
    try { localStorage.setItem(SAVED_STRATEGIES_KEY, JSON.stringify(next)); alert('Strategy saved.') } catch { alert('Could not save.') }
  }

  const loadStrategy = (s: SavedStrategy) => {
    setForm(s.form)
    setReport(JSON.parse(JSON.stringify(s.report)))
    setUnlocked(true)
    setCompareStrategyId(null)
  }

  const removeSavedStrategy = (id: string) => {
    const next = savedStrategies.filter((x) => x.id !== id)
    setSavedStrategies(next)
    if (compareStrategyId === id) setCompareStrategyId(null)
    try { localStorage.setItem(SAVED_STRATEGIES_KEY, JSON.stringify(next)) } catch { /* noop */ }
  }

  const compareStrategy = savedStrategies.find((s) => s.id === compareStrategyId)
  const estimatedSizes = estimateAudienceSizes(form)
  const dataQuality = getDataQualityChecklist(form)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'custom', label: 'Custom Audiences', icon: '👥' },
    { id: 'lookalike', label: 'Lookalike Strategy', icon: '🎯' },
    { id: 'retargeting', label: 'Retargeting Funnel', icon: '🔥' },
    { id: 'platform', label: 'Platform Setup', icon: '⚙️' },
    { id: 'budget', label: 'Budget Allocation', icon: '💰' },
    { id: 'scaling', label: 'Scaling Strategy', icon: '📈' },
    { id: 'advanced', label: 'Advanced Insights', icon: '💡' },
  ]

  return (
    <div className="min-h-screen py-6 px-4 sm:py-8 sm:px-6 lg:px-8 transition-colors" style={{ background: theme.bg, color: theme.text }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: NEON, boxShadow: `0 0 8px ${NEON}` }} />
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: NEON }}>Audience Builder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight m-0">Custom Audience & Lookalike Builder</h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: theme.muted }}>
          Build retargeting, custom, and lookalike audiences across Meta, Google, TikTok, LinkedIn, and Snapchat.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-4">
            <div className="rounded-2xl border p-5 sm:p-6 sticky top-24" style={{ background: theme.card, borderColor: theme.border }}>
              <h2 className="text-sm uppercase tracking-wider font-semibold mb-4" style={{ color: theme.muted }}>Input</h2>
              <div className="space-y-4">
                <MultiSelect options={PLATFORMS} selected={form.platforms} onChange={(v) => updateForm('platforms', v)} theme={theme} label="Platform" />

                {form.platforms.includes('meta') && (
                  <div className="space-y-3 rounded-lg p-3 border" style={{ borderColor: theme.border, background: theme.card }}>
                    <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: theme.muted }}>Meta (required)</span>
                    <div>
                      <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Instagram page URL</label>
                      <input type="url" placeholder="https://instagram.com/yourpage" value={form.metaInstagramUrl} onChange={(e) => updateForm('metaInstagramUrl', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Facebook page URL</label>
                      <input type="url" placeholder="https://facebook.com/yourpage" value={form.metaFacebookUrl} onChange={(e) => updateForm('metaFacebookUrl', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                    </div>
                  </div>
                )}
                {form.platforms.includes('google') && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Google My Business URL (optional)</label>
                    <input type="url" placeholder="https://g.page/yourbusiness or Google Business link" value={form.googleBusinessUrl} onChange={(e) => updateForm('googleBusinessUrl', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                  </div>
                )}
                {form.platforms.includes('tiktok') && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>TikTok page URL <span style={{ color: NEON }}>*</span></label>
                    <input type="url" placeholder="https://tiktok.com/@yourpage" value={form.tiktokPageUrl} onChange={(e) => updateForm('tiktokPageUrl', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                  </div>
                )}
                {form.platforms.includes('linkedin') && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>LinkedIn page URL <span style={{ color: NEON }}>*</span></label>
                    <input type="url" placeholder="https://linkedin.com/company/yourpage" value={form.linkedinPageUrl} onChange={(e) => updateForm('linkedinPageUrl', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                  </div>
                )}
                {form.platforms.includes('snapchat') && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Snapchat page URL <span style={{ color: NEON }}>*</span></label>
                    <input type="url" placeholder="https://snapchat.com/add/yourpage" value={form.snapchatPageUrl} onChange={(e) => updateForm('snapchatPageUrl', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Business Type</label>
                  <select value={form.businessType} onChange={(e) => updateForm('businessType', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Industry</label>
                  <select value={form.industry} onChange={(e) => updateForm('industry', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <input type="text" placeholder="Or custom" value={form.industry} onChange={(e) => updateForm('industry', e.target.value)} className="w-full rounded-lg px-3 py-2 mt-1.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Website (optional)</label>
                  <input type="url" placeholder="https://yoursite.com" value={form.website} onChange={(e) => updateForm('website', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Target Country</label>
                  <select value={form.targetCountry} onChange={(e) => updateForm('targetCountry', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Monthly Traffic</label>
                  <select value={form.monthlyTraffic} onChange={(e) => updateForm('monthlyTraffic', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {TRAFFIC_VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Monthly Ad Budget</label>
                  <select value={form.monthlyBudget} onChange={(e) => updateForm('monthlyBudget', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {AD_BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Funnel Stage</label>
                  <select value={form.funnelStage} onChange={(e) => updateForm('funnelStage', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {FUNNEL_STAGES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Conversion Type</label>
                  <select value={form.conversionType} onChange={(e) => updateForm('conversionType', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {CONVERSION_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>AOV (optional)</label>
                  <input type="text" placeholder="e.g. 50" value={form.averageOrderValue} onChange={(e) => updateForm('averageOrderValue', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                </div>
                <MultiSelect options={DATA_SOURCES} selected={form.dataSources} onChange={(v) => updateForm('dataSources', v)} theme={theme} label="Data Sources" />
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Pixel / Data Size</label>
                  <select value={form.pixelSize} onChange={(e) => updateForm('pixelSize', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {PIXEL_SIZES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: theme.muted }}>Campaign Goal</label>
                  <select value={form.campaignGoal} onChange={(e) => updateForm('campaignGoal', e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                    <option value="">Select</option>
                    {CAMPAIGN_GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="border-t pt-4 mt-4" style={{ borderColor: theme.border }}>
                  <button type="button" onClick={() => setShowEstimator(!showEstimator)} className="text-xs uppercase tracking-wider font-semibold" style={{ color: theme.muted }}>{showEstimator ? '▼' : '▶'} Size estimator</button>
                  {showEstimator && (
                    <>
                      <input type="text" placeholder="Monthly visitors override" value={form.monthlyVisitorsOverride} onChange={(e) => updateForm('monthlyVisitorsOverride', e.target.value)} className="w-full rounded-lg px-3 py-2 mt-2 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                      {estimatedSizes.length > 0 && <ul className="text-xs mt-2 space-y-1" style={{ color: theme.text }}>{estimatedSizes.map((e, i) => <li key={i}><strong>{e.label}:</strong> ~{e.estimated}</li>)}</ul>}
                    </>
                  )}
                </div>
              </div>
              <button type="button" onClick={handleGenerate} disabled={loading} className="w-full mt-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-70" style={{ background: NEON, color: '#0a0a0a' }}>
                {loading ? <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />Generating…</span> : 'Generate Audience Strategy'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            {!report ? (
              <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: theme.border, color: theme.muted }}>
                <p className="text-sm">Fill inputs and click Generate Audience Strategy.</p>
              </div>
            ) : (
              <>
                {!unlocked && (
                  <div className="rounded-2xl border p-6 mb-6" style={{ background: theme.card, borderColor: theme.border }}>
                    <h3 className="font-semibold mb-2" style={{ color: theme.text }}>Unlock full report</h3>
                    <p className="text-sm mb-4" style={{ color: theme.muted }}>Enter your details to view and download the full report.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <input type="text" placeholder="Name" value={leadEmail.name} onChange={(e) => setLeadEmail((p) => ({ ...p, name: e.target.value }))} className="rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                      <input type="email" placeholder="Email" value={leadEmail.email} onChange={(e) => setLeadEmail((p) => ({ ...p, email: e.target.value }))} className="rounded-lg px-3 py-2.5 text-sm border outline-none focus:border-[#AAFF00]" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={unlockReport} className="px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: NEON, color: '#0a0a0a' }}>Unlock full report</button>
                      <Link href="/contact" className="px-4 py-2.5 rounded-lg font-semibold text-sm border inline-block" style={{ borderColor: theme.border }}>Get Expert Help</Link>
                    </div>
                  </div>
                )}

                <div className={`rounded-2xl border overflow-hidden ${!unlocked ? 'relative select-none' : ''}`} style={{ background: theme.card, borderColor: theme.border }}>
                  {!unlocked && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}><p className="text-sm px-4" style={{ color: theme.text }}>Enter your details above to unlock.</p></div>}
                  <div className="p-4 border-b flex flex-wrap gap-2 overflow-x-auto" style={{ borderColor: theme.border }}>
                    {tabs.map((t, i) => (
                      <button key={t.id} type="button" onClick={() => setActiveTab(i)} className="px-3 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors"
                        style={{ background: activeTab === i ? NEON : 'transparent', color: activeTab === i ? '#0a0a0a' : theme.muted, border: activeTab === i ? 'none' : `1px solid ${theme.border}` }}>
                        <span className="mr-1.5" aria-hidden>{t.icon}</span>{t.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 sm:p-6">
                    {activeTab === 0 && report.overview && (
                      <div className="space-y-4">
                        <SectionCard title="Summary" icon="📋" theme={theme} onCopy={() => copySection(report.overview.summary)} onRegenerate={() => regenerateSection('overview')}><p>{report.overview.summary}</p></SectionCard>
                        <SectionCard title="Scores" icon="📊" theme={theme}>
                          <p><strong>Data strength:</strong> {report.overview.dataStrengthScore}</p>
                          <p><strong>Pixel readiness:</strong> {report.overview.pixelReadiness}</p>
                          <p><strong>Funnel:</strong> {report.overview.funnelCompletenessScore}</p>
                          <p><strong>Recommended:</strong> {report.overview.recommendedAudienceTypes.join('; ')}</p>
                        </SectionCard>
                        <SectionCard title="Data quality checklist" icon="✅" theme={theme}>
                          {dataQuality.map((q, i) => (
                            <p key={i}>{q.status === 'yes' ? '✓' : q.status === 'no' ? '✗' : '○'} <strong>{q.item}:</strong> <span style={{ color: theme.muted }}>{q.note}</span></p>
                          ))}
                        </SectionCard>
                        {estimatedSizes.length > 0 && (
                          <SectionCard title="Audience size estimates" icon="📐" theme={theme}>
                            {estimatedSizes.map((e, i) => <p key={i}><strong>{e.label}:</strong> ~{e.estimated} — {e.note}</p>)}
                          </SectionCard>
                        )}
                      </div>
                    )}
                    {activeTab === 1 && report.customAudiences && (
                      <div className="space-y-4">
                        <SectionCard title="Naming" icon="🏷️" theme={theme} onCopy={() => copySection('RT - ATC - 7d | LAL - Purchasers - 1% | Excl - Purchasers - 180d')}>
                          <p className="mb-2">Examples: RT - ATC - 7d, LAL - Purchasers - 1%, Excl - Purchasers - 180d, RT - Visitors - 30d</p>
                        </SectionCard>
                        <SectionCard title="Website audiences" icon="🌐" theme={theme} onRegenerate={() => regenerateSection('customAudiences')}>
                          {report.customAudiences.websiteAudiences.map((a, i) => <div key={i} className="mb-2"><p className="font-medium">{a.name}</p><p style={{ color: theme.muted }}>{a.whenToUse} {a.idealDuration} Min: {a.minSize}</p></div>)}
                        </SectionCard>
                        <SectionCard title="Engagement" icon="👍" theme={theme}>{report.customAudiences.engagementAudiences.map((a, i) => <div key={i}><p className="font-medium">{a.name}</p><p style={{ color: theme.muted }}>{a.whenToUse} — {a.idealDuration}</p></div>)}</SectionCard>
                        <SectionCard title="Customer list" icon="📧" theme={theme}><ul className="list-disc pl-4">{report.customAudiences.customerList.map((c, i) => <li key={i}>{c}</li>)}</ul></SectionCard>
                        <SectionCard title="Exclusions" icon="🚫" theme={theme}><ul className="list-disc pl-4">{report.customAudiences.exclusionLogic.map((e, i) => <li key={i}>{e}</li>)}</ul></SectionCard>
                        <SectionCard title="Size notes" icon="📐" theme={theme}><p>{report.customAudiences.minSizeNote}</p><p className="mt-2">{report.customAudiences.tooSmallNote}</p></SectionCard>
                      </div>
                    )}
                    {activeTab === 2 && report.lookalike && (
                      <div className="space-y-4">
                        <SectionCard title="LAL % strategy" icon="🎯" theme={theme} onRegenerate={() => regenerateSection('lookalike')}>{report.lookalike.lalStrategy.map((l, i) => <p key={i}><strong>{l.range}:</strong> {l.useCase}</p>)}</SectionCard>
                        <SectionCard title="By data size" icon="📊" theme={theme}>{report.lookalike.whichToUse.map((w, i) => <p key={i}><strong>{w.dataSize}:</strong> {w.recommendation}</p>)}</SectionCard>
                        <SectionCard title="Value-based LAL" icon="💰" theme={theme}><p>{report.lookalike.valueBasedLal}</p></SectionCard>
                        <SectionCard title="Stacking & testing" icon="🧪" theme={theme}><p><strong>Stacking:</strong> {report.lookalike.stackingStrategy}</p><p className="mt-2"><strong>Testing:</strong> {report.lookalike.testingPlan}</p></SectionCard>
                      </div>
                    )}
                    {activeTab === 3 && report.retargetingFunnel && (
                      <div className="space-y-4">
                        <SectionCard title="🔥 Hot (0–7d)" icon="🔥" theme={theme} onRegenerate={() => regenerateSection('retargetingFunnel')}><p><strong>Audiences:</strong> {report.retargetingFunnel.hot.audiences.join(', ')}</p><p><strong>Messaging:</strong> {report.retargetingFunnel.hot.messaging}</p><p><strong>Offer:</strong> {report.retargetingFunnel.hot.offer}</p><p><strong>Creative:</strong> {report.retargetingFunnel.hot.creative}</p></SectionCard>
                        <SectionCard title="⚡ Warm (7–30d)" icon="⚡" theme={theme}><p><strong>Audiences:</strong> {report.retargetingFunnel.warm.audiences.join(', ')}</p><p><strong>Messaging:</strong> {report.retargetingFunnel.warm.messaging}</p><p><strong>Offer:</strong> {report.retargetingFunnel.warm.offer}</p><p><strong>Creative:</strong> {report.retargetingFunnel.warm.creative}</p></SectionCard>
                        <SectionCard title="🌊 Cold (30–90d)" icon="🌊" theme={theme}><p><strong>Audiences:</strong> {report.retargetingFunnel.cold.audiences.join(', ')}</p><p><strong>Messaging:</strong> {report.retargetingFunnel.cold.messaging}</p><p><strong>Offer:</strong> {report.retargetingFunnel.cold.offer}</p><p><strong>Creative:</strong> {report.retargetingFunnel.cold.creative}</p></SectionCard>
                      </div>
                    )}
                    {activeTab === 4 && report.platformSetup && (
                      <div className="space-y-4">
                        <SectionCard title="Meta" icon="📘" theme={theme} onRegenerate={() => regenerateSection('platformSetup')}><ul className="list-disc pl-4">{report.platformSetup.meta.map((s, i) => <li key={i}>{s}</li>)}</ul></SectionCard>
                        <SectionCard title="Google" icon="🔍" theme={theme}><ul className="list-disc pl-4">{report.platformSetup.google.map((s, i) => <li key={i}>{s}</li>)}</ul></SectionCard>
                        <SectionCard title="TikTok" icon="🎵" theme={theme}><ul className="list-disc pl-4">{report.platformSetup.tiktok.map((s, i) => <li key={i}>{s}</li>)}</ul></SectionCard>
                        <SectionCard title="LinkedIn" icon="💼" theme={theme}><ul className="list-disc pl-4">{report.platformSetup.linkedin.map((s, i) => <li key={i}>{s}</li>)}</ul></SectionCard>
                        <SectionCard title="Snapchat" icon="👻" theme={theme}><ul className="list-disc pl-4">{report.platformSetup.snapchat.map((s, i) => <li key={i}>{s}</li>)}</ul></SectionCard>
                      </div>
                    )}
                    {activeTab === 5 && report.budgetAllocation && (
                      <div className="space-y-4">
                        <SectionCard title="Budget split" icon="💰" theme={theme} onRegenerate={() => regenerateSection('budgetAllocation')}><p><strong>Cold:</strong> {report.budgetAllocation.coldPct} <strong>Warm:</strong> {report.budgetAllocation.warmPct} <strong>Hot:</strong> {report.budgetAllocation.hotPct}</p><p className="mt-2">{report.budgetAllocation.minBudgetPerAudience}</p><p className="mt-2">{report.budgetAllocation.scalingRecommendations}</p></SectionCard>
                        <SectionCard title="Budget helper" icon="📅" theme={theme}><p>Small ~$1.5K/mo, Medium ~$5K, Large ~$20K. Min ~$15–25/day per ad set. Frequency cap retargeting 3–5/day.</p></SectionCard>
                      </div>
                    )}
                    {activeTab === 6 && report.scalingStrategy && (
                      <div className="space-y-4">
                        <SectionCard title="Scaling" icon="📈" theme={theme} onRegenerate={() => regenerateSection('scalingStrategy')}><p><strong>Expand LAL:</strong> {report.scalingStrategy.expandLal}</p><p><strong>Add audiences:</strong> {report.scalingStrategy.addAudiences}</p><p><strong>Creative refresh:</strong> {report.scalingStrategy.creativeRefresh}</p><p><strong>Frequency:</strong> {report.scalingStrategy.frequencyMonitoring}</p></SectionCard>
                      </div>
                    )}
                    {activeTab === 7 && report.advancedInsights && (
                      <div className="space-y-4">
                        <SectionCard title="Overlap & frequency" icon="⚠️" theme={theme} onRegenerate={() => regenerateSection('advancedInsights')}><p><strong>Overlap:</strong> {report.advancedInsights.overlapWarning}</p><p><strong>Frequency risk:</strong> {report.advancedInsights.frequencyRisk}</p><p><strong>Saturation:</strong> {report.advancedInsights.saturationSignals}</p></SectionCard>
                        <SectionCard title="Opportunities" icon="💡" theme={theme}><p>{report.advancedInsights.hiddenOpportunities}</p></SectionCard>
                        <SectionCard title="Mistakes to avoid" icon="🛑" theme={theme}><ul className="list-disc pl-4">{report.advancedInsights.mistakesToAvoid.map((m, i) => <li key={i}>{m}</li>)}</ul></SectionCard>
                        <SectionCard title="Pro tips" icon="✨" theme={theme}><ul className="list-disc pl-4">{report.advancedInsights.proTips.map((t, i) => <li key={i}>{t}</li>)}</ul></SectionCard>
                      </div>
                    )}
                  </div>
                </div>

                {unlocked && (
                  <>
                    <div className="rounded-2xl border p-4 mb-4 mt-4" style={{ background: theme.card, borderColor: theme.border }}>
                      <h3 className="text-sm uppercase tracking-wider font-semibold mb-3" style={{ color: theme.muted }}>Saved strategies</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button type="button" onClick={saveReportAs} className="px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: theme.border }}>Save as strategy</button>
                        {savedStrategies.length > 0 && (
                          <>
                            <select value={compareStrategyId || ''} onChange={(e) => setCompareStrategyId(e.target.value || null)} className="rounded-lg px-3 py-2 text-sm border" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                              <option value="">Compare with...</option>
                              {savedStrategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {savedStrategies.map((s) => (
                              <span key={s.id} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border" style={{ borderColor: theme.border }}>
                                <button type="button" onClick={() => loadStrategy(s)} className="font-medium" style={{ color: NEON }}>Load</button>
                                <span style={{ color: theme.muted }}>{s.name}</span>
                                <button type="button" onClick={() => removeSavedStrategy(s.id)} aria-label="Remove">×</button>
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                      {compareStrategy && report && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t text-sm" style={{ borderColor: theme.border }}>
                          <div><p className="font-semibold mb-2">Current</p><p>{report.overview.summary.slice(0, 100)}…</p><p className="mt-1" style={{ color: theme.muted }}>Data: {report.overview.dataStrengthScore}</p></div>
                          <div><p className="font-semibold mb-2">Saved: {compareStrategy.name}</p><p>{compareStrategy.report.overview.summary.slice(0, 100)}…</p><p className="mt-1" style={{ color: theme.muted }}>Data: {compareStrategy.report.overview.dataStrengthScore}</p></div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={copyAll} className="px-4 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: theme.border }}>Copy all</button>
                      <button type="button" onClick={() => window.print()} className="px-4 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: theme.border }}>Download Audience Plan</button>
                      <button type="button" onClick={saveReport} className="px-4 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: theme.border }}>Save report</button>
                      <button type="button" onClick={shareLink} className="px-4 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: theme.border }}>{shareCopied ? 'Link copied' : 'Share link'}</button>
                      <Link href="/contact" className="px-4 py-2.5 rounded-lg text-sm font-semibold border inline-flex items-center" style={{ borderColor: theme.border }}>Book Strategy Call</Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
