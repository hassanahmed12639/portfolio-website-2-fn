import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCookieName, verifySessionToken } from '@/lib/portfolio-auth'
import { rateLimit } from '@/lib/rate-limit'
import { DEFAULT_RESUME_SETTINGS } from '@/lib/portfolio-settings'

export const dynamic = 'force-dynamic'

function deny(message: string, status = 401) {
  return NextResponse.json({ error: message }, { status })
}

function checkAuth(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = rateLimit(`portfolio-admin-resume:${ip}`, { windowMs: 60_000, maxRequests: 40 })
  if (!rate.success) return deny('Too many requests', 429)
  const token = request.cookies.get(getCookieName())?.value
  if (!token || !verifySessionToken(token)) return deny('Unauthorized', 401)
  return null
}

function mapPayload(body: Record<string, unknown>) {
  return {
    hero_badge:
      typeof body.heroBadge === 'string' && body.heroBadge.trim()
        ? body.heroBadge.trim()
        : DEFAULT_RESUME_SETTINGS.heroBadge,
    hero_title:
      typeof body.heroTitle === 'string' && body.heroTitle.trim()
        ? body.heroTitle.trim()
        : DEFAULT_RESUME_SETTINGS.heroTitle,
    hero_prefix:
      typeof body.heroPrefix === 'string' && body.heroPrefix.trim()
        ? body.heroPrefix.trim()
        : DEFAULT_RESUME_SETTINGS.heroPrefix,
    rotate_words: Array.isArray(body.rotateWords) ? body.rotateWords : DEFAULT_RESUME_SETTINGS.rotateWords,
    contact_links: Array.isArray(body.contactLinks)
      ? body.contactLinks
      : DEFAULT_RESUME_SETTINGS.contactLinks,
    skills: Array.isArray(body.skills) ? body.skills : DEFAULT_RESUME_SETTINGS.skills,
    tools: Array.isArray(body.tools) ? body.tools : DEFAULT_RESUME_SETTINGS.tools,
    updated_at: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_resume_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      const { data: seeded, error: seedError } = await admin
        .from('portfolio_resume_settings')
        .insert(mapPayload(DEFAULT_RESUME_SETTINGS as unknown as Record<string, unknown>))
        .select('*')
        .single()
      if (seedError) throw seedError
      return NextResponse.json(seeded)
    }
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch resume settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError
  try {
    const body = (await request.json()) as Record<string, unknown>
    const payload = mapPayload(body)
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('portfolio_resume_settings')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!existing?.id) {
      const { data, error } = await admin
        .from('portfolio_resume_settings')
        .insert(payload)
        .select('*')
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    const { data, error } = await admin
      .from('portfolio_resume_settings')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update resume settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
