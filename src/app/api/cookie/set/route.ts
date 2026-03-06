import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const apiKey = searchParams.get('api_key')

  // Get existing cookie or create new visitor ID
  const existingId = req.cookies.get('_th_id')?.value
  const visitorId = existingId || `th_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const isReturning = !!existingId

  // Get cookie lifetime from user's settings (default 180 days)
  let cookieLifetimeDays = 180

  try {
    if (apiKey) {
      const { data: settings } = await supabaseAdmin
        .from('cookie_settings')
        .select('cookie_lifetime_days, is_enabled')
        .eq('api_key', apiKey)
        .single()

      if (settings?.cookie_lifetime_days) {
        cookieLifetimeDays = settings.cookie_lifetime_days
      }

      // Track visitor in Supabase
      if (settings?.is_enabled) {
        await supabaseAdmin
          .from('visitors')
          .upsert({
            visitor_id: visitorId,
            api_key: apiKey,
            is_returning: isReturning,
            last_seen: new Date().toISOString(),
            visit_count: isReturning ? 1 : 1
          }, {
            onConflict: 'visitor_id',
            ignoreDuplicates: false
          })
      }
    }
  } catch (err) {
    console.error('[Cookie] Error:', err)
  }

  // Create 1x1 transparent GIF response
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

  const maxAge = cookieLifetimeDays * 24 * 60 * 60

  const response = new NextResponse(gif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  })

  // Set long-lived server cookie
  response.cookies.set('_th_id', visitorId, {
    maxAge: maxAge,
    path: '/',
    httpOnly: false,
    sameSite: 'none',
    secure: true
  })

  console.log('[Cookie] Set _th_id:', visitorId, 'lifetime:', cookieLifetimeDays, 'days', isReturning ? '(returning)' : '(new)')

  return response
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
