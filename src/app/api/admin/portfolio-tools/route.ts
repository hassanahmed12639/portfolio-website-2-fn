import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCookieName, verifySessionToken } from '@/lib/portfolio-auth'
import { rateLimit } from '@/lib/rate-limit'
import { DEFAULT_PORTFOLIO_TOOLS } from '@/lib/portfolio-settings'

export const dynamic = 'force-dynamic'

function deny(message: string, status = 401) {
  return NextResponse.json({ error: message }, { status })
}

function checkAuth(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = rateLimit(`portfolio-admin-tools:${ip}`, { windowMs: 60_000, maxRequests: 60 })
  if (!rate.success) return deny('Too many requests', 429)
  const token = request.cookies.get(getCookieName())?.value
  if (!token || !verifySessionToken(token)) return deny('Unauthorized', 401)
  return null
}

export async function GET(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_tools')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    if (!data || data.length === 0) {
      const rows = DEFAULT_PORTFOLIO_TOOLS.map((tool, index) => ({
        slug: tool.slug,
        name: tool.name,
        sort_order: index,
        is_active: true,
        updated_at: new Date().toISOString(),
      }))
      const { data: seeded, error: seedError } = await admin
        .from('portfolio_tools')
        .insert(rows)
        .select('*')
        .order('sort_order', { ascending: true })
      if (seedError) throw seedError
      return NextResponse.json(seeded ?? [])
    }
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tools'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError
  try {
    const body = (await request.json()) as {
      slug?: string
      name?: string
      sort_order?: number
      is_active?: boolean
    }
    const slug = body.slug?.trim().toLowerCase()
    const name = body.name?.trim()
    if (!slug || !name) return deny('Missing slug or name', 400)
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_tools')
      .insert({
        slug,
        name,
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create tool'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError
  try {
    const body = (await request.json()) as {
      id?: string
      slug?: string
      name?: string
      sort_order?: number
      is_active?: boolean
    }
    if (!body.id) return deny('Missing id', 400)
    const slug = body.slug?.trim().toLowerCase()
    const name = body.name?.trim()
    if (!slug || !name) return deny('Missing slug or name', 400)
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('portfolio_tools')
      .update({
        slug,
        name,
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update tool'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request)
  if (authError) return authError
  try {
    const body = (await request.json()) as { id?: string }
    if (!body.id) return deny('Missing id', 400)
    const admin = createAdminClient()
    const { error } = await admin.from('portfolio_tools').delete().eq('id', body.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete tool'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
