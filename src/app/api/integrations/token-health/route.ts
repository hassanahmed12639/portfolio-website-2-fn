import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/encrypt'

export const dynamic = 'force-dynamic'

type SupportedPlatform = 'meta' | 'tiktok'

function normalizePlatform(value: string | undefined): SupportedPlatform | null {
  if (value === 'meta' || value === 'tiktok') return value
  return null
}

const META_100_HELP =
  'Generate a new token: Events Manager → select your Pixel → Settings → Generate Access Token (use the token from there, not from other tools).'

function parseMetaError(data: { error?: { code?: number; message?: string; error_user_msg?: string } }) {
  const code = data?.error?.code
  const rawMsg = data?.error?.message || (typeof data?.error?.error_user_msg === 'string' ? data.error.error_user_msg : null)
  if (code === 100 || (typeof rawMsg === 'string' && rawMsg.includes('(#100)') && rawMsg.toLowerCase().includes('permission'))) {
    return META_100_HELP
  }
  return rawMsg || 'Meta token appears invalid or expired'
}

async function validateMetaToken(pixelId: string, accessToken: string) {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${pixelId}?fields=id,name&access_token=${encodeURIComponent(accessToken)}`,
    { method: 'GET', cache: 'no-store' }
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data?.error) {
    const message = parseMetaError(data)
    return { valid: false, message }
  }
  return { valid: true, message: 'Meta token is valid' }
}

async function validateTikTokToken(pixelId: string, accessToken: string) {
  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: 'Pageview',
        event_time: Math.floor(Date.now() / 1000),
        event_id: `token_health_${Date.now()}`,
        user: {
          ip: '127.0.0.1',
          user_agent: 'TrackHive-TokenHealth/1.0',
        },
        properties: {
          event_source_url: 'https://trackhive.local/token-health',
        },
        page: {
          url: 'https://trackhive.local/token-health',
        },
      },
    ],
  }

  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  const ok = res.ok && data?.code === 0
  if (!ok) {
    const message =
      (typeof data?.message === 'string' && data.message) ||
      (typeof data?.msg === 'string' && data.msg) ||
      'TikTok token appears invalid or expired'
    return { valid: false, message }
  }

  return { valid: true, message: 'TikTok token is valid' }
}

export async function POST(request: NextRequest) {
  try {
    const serverClient = await createServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const platform = normalizePlatform(body?.platform)
    if (!platform) {
      return NextResponse.json({ error: 'platform must be meta or tiktok' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('pixel_id, access_token')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const pixelId = integration?.pixel_id?.toString().trim() || ''
    const encryptedToken = integration?.access_token?.toString().trim() || ''

    if (!pixelId || !encryptedToken) {
      return NextResponse.json({
        valid: false,
        platform,
        status: 'missing',
        message: 'Saved pixel ID or token is missing',
      })
    }

    const accessToken = await decrypt(encryptedToken)
    const result =
      platform === 'meta'
        ? await validateMetaToken(pixelId, accessToken)
        : await validateTikTokToken(pixelId, accessToken)

    return NextResponse.json({
      valid: result.valid,
      platform,
      status: result.valid ? 'valid' : 'invalid',
      message: result.message,
      checked_at: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
