import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { getCookieName, verifySessionToken } from '@/lib/portfolio-auth'
import { isPortfolioAdminHost } from '@/lib/portfolio-admin'

export const dynamic = 'force-dynamic'

function checkAdminRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = rateLimit(`admin:${ip}`, { windowMs: 60000, maxRequests: 30 })
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  return null
}

async function verifyAdmin(request: NextRequest) {
  const host = request.headers.get('host')
  const portfolioCookie = request.cookies.get(getCookieName())?.value
  if (isPortfolioAdminHost(host) && portfolioCookie && verifySessionToken(portfolioCookie)) {
    const admin = createAdminClient()
    return { ok: true as const, admin }
  }

  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { ok: false as const, status: 403 }
  return { ok: true as const, admin }
}

// GET — fetch all pseo pages
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = checkAdminRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse
    const result = await verifyAdmin(request)
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const { data, error } = await admin
      .from('pseo_pages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — create new pseo page
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = checkAdminRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse
    const result = await verifyAdmin(req)
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const body = await req.json()
    const { data, error } = await admin
      .from('pseo_pages')
      .insert({ ...body, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT — update existing pseo page
export async function PUT(req: NextRequest) {
  try {
    const rateLimitResponse = checkAdminRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse
    const result = await verifyAdmin(req)
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const body = await req.json()
    const { id, ...rest } = body
    const { data, error } = await admin
      .from('pseo_pages')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — delete pseo page
export async function DELETE(req: NextRequest) {
  try {
    const rateLimitResponse = checkAdminRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse
    const result = await verifyAdmin(req)
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const { id } = await req.json()
    const { error } = await admin
      .from('pseo_pages')
      .delete()
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

