import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/request-security'
import { rateLimit, getRateLimitStatsSnapshot } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const limiter = rateLimit(`admin-security|ip=${ip}`, {
    windowMs: 60_000,
    maxRequests: 30,
  })
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limiter.retryAfterSeconds),
        },
      }
    )
  }

  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const topRaw = Number(new URL(request.url).searchParams.get('top') || 20)
  const top = Number.isFinite(topRaw) ? Math.min(100, Math.max(1, Math.floor(topRaw))) : 20
  const snapshot = getRateLimitStatsSnapshot(top)
  const rateBudgets = [
    { scope: 'api:default', maxRequestsPerMinute: 90 },
    { scope: 'api:event', maxRequestsPerMinute: 220 },
    { scope: 'api:webhook-ingest', maxRequestsPerMinute: 120 },
    { scope: 'api:chatbot', maxRequestsPerMinute: 20 },
    { scope: 'api:admin', maxRequestsPerMinute: 60 },
    { scope: 'api:team-verify-invite', maxRequestsPerMinute: 15 },
    { scope: 'api:team-accept-invite', maxRequestsPerMinute: 10 },
    { scope: 'api:cron', maxRequestsPerMinute: 30 },
    { scope: 'api:proxy', maxRequestsPerMinute: 300 },
    { scope: 'api:track', maxRequestsPerMinute: 300 },
  ]

  return NextResponse.json({
    generatedAt: snapshot.generatedAt,
    totals: snapshot.totals,
    totalScopes: snapshot.totalScopes,
    topScopes: snapshot.scopes,
    configuredBudgets: rateBudgets,
    notes: [
      'Stats are in-memory per app instance.',
      'In multi-instance deployments, aggregate at edge/log provider level for full visibility.',
    ],
  })
}

