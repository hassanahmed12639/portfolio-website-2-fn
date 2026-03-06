import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateLimitResult = rateLimit(`leads:${ip}`, { windowMs: 60000, maxRequests: 50 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const score = searchParams.get('score')
    const stage = searchParams.get('stage')

    const supabaseAdmin = createAdminClient()
    let query = supabaseAdmin
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(Math.min(100, Math.max(1, limit)))

    if (score) query = query.eq('score', score)
    if (stage) query = query.eq('stage', stage)

    const { data: leads, error } = await query

    if (error) {
      console.error('[Leads] Error fetching:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leads: leads ?? [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[leads] GET error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
