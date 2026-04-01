import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const CHECKS = [
  { name: 'SUPABASE_URL', key: 'NEXT_PUBLIC_SUPABASE_URL', warning: false },
  { name: 'SERVICE_ROLE_KEY', key: 'SUPABASE_SERVICE_ROLE_KEY', warning: false },
  { name: 'RESEND_API_KEY', key: 'RESEND_API_KEY', warning: false },
  { name: 'CRON_SECRET', key: 'CRON_SECRET', warning: true },
]

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

  const envChecks = CHECKS.map(({ name, key, warning }) => {
    const configured = !!process.env[key]
    return {
      name,
      key,
      configured,
      status: configured ? 'ok' : (warning ? 'warning' : 'error'),
      detail: configured ? 'Configured' : (warning ? 'Not set' : 'Missing'),
    }
  })

  const supabaseOk = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [
    { count: retryPending },
    { count: failedToday },
    { count: totalPixels },
  ] = await Promise.all([
    admin.from('retry_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('events').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', todayStart),
    admin.from('pixels').select('id', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    envChecks,
    supabaseConnection: supabaseOk ? 'ok' : 'error',
    retryPending: retryPending || 0,
    failedToday: failedToday || 0,
    totalPixels: totalPixels || 0,
  })
}

