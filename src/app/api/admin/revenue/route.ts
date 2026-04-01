import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = rateLimit(`admin:${ip}`, { windowMs: 60000, maxRequests: 30 })
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: profiles } = await admin.from('profiles').select('plan')

  const freeUsers = profiles?.filter((p) => p.plan === 'free').length ?? 0
  const proUsers = profiles?.filter((p) => p.plan === 'pro').length ?? 0
  const agencyUsers = profiles?.filter((p) => p.plan === 'agency').length ?? 0
  const subscribers = proUsers + agencyUsers
  const mrr = proUsers * 10 + agencyUsers * 25

  return NextResponse.json({
    mrr,
    subscribers,
    freeUsers,
    proUsers,
    agencyUsers,
  })
}

