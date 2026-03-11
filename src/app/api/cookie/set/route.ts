import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase admin config')
  return createAdmin(url, key)
}

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
      const supabaseAdmin = getAdminClient()
      // Resolve user_id: api_key can be profile.api_key (TrackHive key) or pixel_id (Meta pixel ID)
      let userId: string | undefined
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('api_key', apiKey)
        .single()
      if (profile?.id) {
        userId = profile.id
      } else {
        const { data: pixel } = await supabaseAdmin
          .from('pixels')
          .select('user_id')
          .eq('pixel_id', apiKey)
          .single()
        userId = pixel?.user_id
      }

      // Get cookie settings by user_id (cookie_settings has user_id, not api_key)
      let isEnabled = true
      if (userId) {
        const { data: settings } = await supabaseAdmin
          .from('cookie_settings')
          .select('cookie_lifetime_days, is_active')
          .eq('user_id', userId)
          .single()

        if (settings?.cookie_lifetime_days) {
          cookieLifetimeDays = settings.cookie_lifetime_days
        }
        isEnabled = settings?.is_active ?? true
      }

      // Track visitor in Supabase (when cookie extender is enabled)
      if (isEnabled && userId) {
        const visitorRow: {
          visitor_id: string
          api_key: string
          user_id: string
          is_returning: boolean
          first_seen?: string
          last_seen: string
          visit_count: number
        } = {
          visitor_id: visitorId,
          api_key: apiKey,
          user_id: userId,
          is_returning: isReturning,
          last_seen: new Date().toISOString(),
          visit_count: 1,
        }
        if (!isReturning) {
          visitorRow.first_seen = new Date().toISOString()
        }
        await supabaseAdmin
          .from('visitors')
          .upsert(visitorRow, {
            onConflict: 'visitor_id',
            ignoreDuplicates: false,
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
