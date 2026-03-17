import { createAdminClient } from '@/lib/supabase/admin'

export type PortfolioTool = {
  slug: string
  name: string
}

export type PortfolioResumeSettings = {
  heroBadge: string
  heroTitle: string
  heroPrefix: string
  rotateWords: string[]
  contactLinks: { label: string; href: string }[]
  skills: string[]
  tools: string[]
}

export const DEFAULT_PORTFOLIO_TOOLS: PortfolioTool[] = [
  { slug: 'meta', name: 'Meta' },
  { slug: 'googleads', name: 'Google Ads' },
  { slug: 'tiktok', name: 'TikTok' },
  { slug: 'snapchat', name: 'Snapchat' },
  { slug: 'googletagmanager', name: 'GTM' },
  { slug: 'shopify', name: 'Shopify' },
  { slug: 'woocommerce', name: 'WooCommerce' },
  { slug: 'googleanalytics', name: 'Google Analytics' },
  { slug: 'zapier', name: 'Zapier' },
  { slug: 'stripe', name: 'Stripe' },
  { slug: 'hotjar', name: 'Hotjar' },
  { slug: 'supabase', name: 'Supabase' },
  { slug: 'cursor', name: 'Cursor' },
]

export const DEFAULT_RESUME_SETTINGS: PortfolioResumeSettings = {
  heroBadge: 'Performance Marketer - 5+ Years',
  heroTitle: 'Hassan Ahmed',
  heroPrefix: 'I build systems that',
  rotateWords: ['Convert!', 'Scale!', 'Perform!', 'Grow!', 'Sell!', 'Win!', 'Deliver!'],
  contactLinks: [
    { label: 'Email', href: 'mailto:hassanonclouds@gmail.com' },
    { label: 'Phone', href: 'tel:+923313317401' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hassanahmed25/' },
    { label: 'Portfolio', href: 'https://shorturl.at/rxysa' },
  ],
  skills: [
    'Keyword Research',
    'Technical SEO',
    'PPC Optimization',
    'Conversion Tracking',
    'A/B Testing',
    'Data Visualization',
    'Account Structuring',
    'AD Account Audit',
    'Content Semantics',
  ],
  tools: [
    'SEMrush',
    'Ahrefs',
    'Moz',
    'Screaming Frog',
    'Google Analytics',
    'Looker Studio',
    'HubSpot',
    'Zoho',
    'monday.com',
    'Trello',
  ],
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function asContactLinks(value: unknown): { label: string; href: string }[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      const label = typeof rec.label === 'string' ? rec.label.trim() : ''
      const href = typeof rec.href === 'string' ? rec.href.trim() : ''
      if (!label || !href) return null
      return { label, href }
    })
    .filter((item): item is { label: string; href: string } => !!item)
}

export async function getPortfolioTools(): Promise<PortfolioTool[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_tools')
      .select('slug,name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    if (!data || data.length === 0) return DEFAULT_PORTFOLIO_TOOLS
    return data as PortfolioTool[]
  } catch {
    return DEFAULT_PORTFOLIO_TOOLS
  }
}

export async function getPortfolioResumeSettings(): Promise<PortfolioResumeSettings> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_resume_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (!data) return DEFAULT_RESUME_SETTINGS
    return {
      heroBadge:
        typeof data.hero_badge === 'string' && data.hero_badge.trim()
          ? data.hero_badge
          : DEFAULT_RESUME_SETTINGS.heroBadge,
      heroTitle:
        typeof data.hero_title === 'string' && data.hero_title.trim()
          ? data.hero_title
          : DEFAULT_RESUME_SETTINGS.heroTitle,
      heroPrefix:
        typeof data.hero_prefix === 'string' && data.hero_prefix.trim()
          ? data.hero_prefix
          : DEFAULT_RESUME_SETTINGS.heroPrefix,
      rotateWords: asStringArray(data.rotate_words).length
        ? asStringArray(data.rotate_words)
        : DEFAULT_RESUME_SETTINGS.rotateWords,
      contactLinks: asContactLinks(data.contact_links).length
        ? asContactLinks(data.contact_links)
        : DEFAULT_RESUME_SETTINGS.contactLinks,
      skills: asStringArray(data.skills).length ? asStringArray(data.skills) : DEFAULT_RESUME_SETTINGS.skills,
      tools: asStringArray(data.tools).length ? asStringArray(data.tools) : DEFAULT_RESUME_SETTINGS.tools,
    }
  } catch {
    return DEFAULT_RESUME_SETTINGS
  }
}
