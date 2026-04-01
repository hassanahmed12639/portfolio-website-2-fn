import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function checkAdminRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = rateLimit(`admin:${ip}`, { windowMs: 60000, maxRequests: 30 })
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  return null
}

async function verifyAdmin() {
  const supabase = await createClient()
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = checkAdminRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse
    const result = await verifyAdmin()
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const { id } = await params
    const { data: page, error } = await admin
      .from('pseo_pages')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error

    const { data: steps } = await admin
      .from('pseo_steps')
      .select('*')
      .eq('page_id', id)
      .order('step_number')

    const { data: compareRows } = await admin
      .from('pseo_compare_rows')
      .select('*')
      .eq('page_id', id)
      .order('sort_order')

    return NextResponse.json({ ...page, steps: steps ?? [], compareRows: compareRows ?? [] })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
