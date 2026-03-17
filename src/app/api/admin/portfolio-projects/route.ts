import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCookieName, verifySessionToken } from '@/lib/portfolio-auth'
import { rateLimit } from '@/lib/rate-limit'
import { caseStudies } from '@/data/caseStudies'

export const dynamic = 'force-dynamic'

type ProjectPayload = {
  id?: string
  slug: string
  date?: string
  title: string
  src: string
  author: string
  authorTitle?: string
  description: string
  readTime?: string
  sections?: { id: string; heading: string; content: string }[]
  keyTakeaways?: string[]
  contentImage?: { src: string; afterSectionId?: string; alt?: string } | null
  contentImages?: { src: string; alt?: string }[]
  sortOrder?: number
  isPublished?: boolean
}

function deny(message: string, status = 401) {
  return NextResponse.json({ error: message }, { status })
}

function checkAuth(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = rateLimit(`portfolio-admin:${ip}`, { windowMs: 60_000, maxRequests: 60 })
  if (!rate.success) return deny('Too many requests', 429)

  const token = request.cookies.get(getCookieName())?.value
  if (!token || !verifySessionToken(token)) return deny('Unauthorized', 401)
  return null
}

function normalizePayload(payload: ProjectPayload) {
  const slug = payload.slug?.trim().toLowerCase() ?? ''
  const title = payload.title?.trim() ?? ''
  const src = payload.src?.trim() ?? ''
  const author = payload.author?.trim() ?? ''
  const description = payload.description?.trim() ?? ''

  if (!slug || !title || !src || !author || !description) {
    throw new Error('Missing required fields: slug, title, src, author, description')
  }

  return {
    slug,
    date: payload.date?.trim() || null,
    title,
    src,
    author,
    author_title: payload.authorTitle?.trim() || null,
    description,
    read_time: payload.readTime?.trim() || null,
    sections: Array.isArray(payload.sections) ? payload.sections : [],
    key_takeaways: Array.isArray(payload.keyTakeaways) ? payload.keyTakeaways : [],
    content_image: payload.contentImage ?? null,
    content_images: Array.isArray(payload.contentImages) ? payload.contentImages : [],
    sort_order: typeof payload.sortOrder === 'number' ? payload.sortOrder : 0,
    is_published: payload.isPublished !== false,
    updated_at: new Date().toISOString(),
  }
}

function mapStaticProject(project: (typeof caseStudies)[number], index: number) {
  return {
    slug: project.slug,
    date: project.date ?? null,
    title: project.title,
    src: project.src,
    author: project.author,
    author_title: project.authorTitle ?? null,
    description: project.description,
    read_time: project.readTime ?? null,
    sections: project.sections ?? [],
    key_takeaways: project.keyTakeaways ?? [],
    content_image: project.contentImage ?? null,
    content_images: project.contentImages ?? [],
    sort_order: index,
    is_published: true,
    updated_at: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_projects')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) {
      const seededRows = caseStudies.map(mapStaticProject)
      const { data: seeded, error: seedError } = await admin
        .from('portfolio_projects')
        .insert(seededRows)
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
      if (seedError) throw seedError
      return NextResponse.json(seeded ?? [])
    }
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError

  try {
    const payload = (await request.json()) as ProjectPayload
    const admin = createAdminClient()
    const normalized = normalizePayload(payload)

    const { data, error } = await admin
      .from('portfolio_projects')
      .insert(normalized)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError

  try {
    const payload = (await request.json()) as ProjectPayload
    if (!payload.id) return deny('Missing project id', 400)

    const admin = createAdminClient()
    const normalized = normalizePayload(payload)
    const { data, error } = await admin
      .from('portfolio_projects')
      .update(normalized)
      .eq('id', payload.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError

  try {
    const body = (await request.json()) as { id?: string }
    if (!body.id) return deny('Missing project id', 400)

    const admin = createAdminClient()
    const { error } = await admin.from('portfolio_projects').delete().eq('id', body.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
