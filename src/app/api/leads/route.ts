import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
  try {
    const supabase = await await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, score, stage, notes } = body

    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })

    const supabaseAdmin = createAdminClient()
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (score !== undefined) updateData.score = score
    if (stage !== undefined) updateData.stage = stage
    if (notes !== undefined) updateData.notes = notes

    const { error } = await supabaseAdmin
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[Leads] Update error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await await createClient()
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

