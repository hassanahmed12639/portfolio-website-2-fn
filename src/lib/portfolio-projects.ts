import type { CaseStudy } from '@/data/caseStudies'
import { caseStudies as staticCaseStudies } from '@/data/caseStudies'
import { createAdminClient } from '@/lib/supabase/admin'

type PortfolioProjectRow = {
  id: string
  slug: string
  date: string | null
  title: string
  src: string
  author: string
  author_title: string | null
  description: string
  read_time: string | null
  sections: unknown
  key_takeaways: unknown
  content_image: unknown
  content_images: unknown
  sort_order: number | null
  is_published: boolean | null
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function asSections(value: unknown): { id: string; heading: string; content: string }[] {
  if (!Array.isArray(value)) return []
  return value
    .map((section) => {
      if (!section || typeof section !== 'object') return null
      const record = section as Record<string, unknown>
      const id = asString(record.id).trim()
      const heading = asString(record.heading).trim()
      const content = asString(record.content).trim()
      if (!id || !heading || !content) return null
      return { id, heading, content }
    })
    .filter((item): item is { id: string; heading: string; content: string } => !!item)
}

function asContentImage(value: unknown): { src: string; afterSectionId?: string; alt?: string } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  const src = asString(record.src).trim()
  if (!src) return undefined
  const afterSectionId = asString(record.afterSectionId).trim()
  const alt = asString(record.alt).trim()
  return {
    src,
    ...(afterSectionId ? { afterSectionId } : {}),
    ...(alt ? { alt } : {}),
  }
}

function asContentImages(value: unknown): { src: string; alt?: string }[] | undefined {
  if (!Array.isArray(value)) return undefined
  const images = value
    .map((img) => {
      if (!img || typeof img !== 'object') return null
      const record = img as Record<string, unknown>
      const src = asString(record.src).trim()
      if (!src) return null
      const alt = asString(record.alt).trim()
      return { src, ...(alt ? { alt } : {}) }
    })
    .filter((item): item is { src: string; alt?: string } => !!item)
  return images.length > 0 ? images : undefined
}

function normalizeProject(row: PortfolioProjectRow): CaseStudy {
  return {
    slug: row.slug,
    date: row.date ?? '',
    title: row.title,
    src: row.src,
    author: row.author,
    authorTitle: row.author_title ?? undefined,
    description: row.description,
    readTime: row.read_time ?? undefined,
    sections: asSections(row.sections),
    keyTakeaways: asStringArray(row.key_takeaways),
    contentImage: asContentImage(row.content_image),
    contentImages: asContentImages(row.content_images),
  }
}

export async function getPortfolioProjects(options?: {
  includeDrafts?: boolean
  limit?: number
}): Promise<CaseStudy[]> {
  const includeDrafts = !!options?.includeDrafts
  try {
    const admin = createAdminClient()
    let query = admin
      .from('portfolio_projects')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (!includeDrafts) {
      query = query.eq('is_published', true)
    }

    if (typeof options?.limit === 'number' && options.limit > 0) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) {
      return includeDrafts ? staticCaseStudies : staticCaseStudies
    }
    return (data as PortfolioProjectRow[]).map(normalizeProject)
  } catch {
    return includeDrafts ? staticCaseStudies : staticCaseStudies
  }
}

export async function getPortfolioProjectBySlug(slug: string): Promise<CaseStudy | undefined> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    if (error) throw error
    if (!data) return staticCaseStudies.find((item) => item.slug === slug)
    return normalizeProject(data as PortfolioProjectRow)
  } catch {
    return staticCaseStudies.find((item) => item.slug === slug)
  }
}
