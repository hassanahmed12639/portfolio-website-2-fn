import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { event_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const eventId = body?.event_id
  if (!eventId || typeof eventId !== 'string') {
    return NextResponse.json({ success: false, message: 'event_id required' }, { status: 400 })
  }

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ success: false, message: 'Server misconfiguration' }, { status: 500 })
  }

  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: event, error: eventError } = await serviceSupabase
    .from('events')
    .select('id, user_id, platform, status, original_payload, retry_count')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
  }
  if (event.user_id !== user.id) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  }
  if (event.status !== 'failed') {
    return NextResponse.json({ success: false, message: 'Event is not in failed state' }, { status: 400 })
  }

  const { data: integrations } = await serviceSupabase
    .from('integrations')
    .select('platform, pixel_id, access_token')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const integration = integrations?.find((i) => i.platform === event.platform)
  if (!integration) {
    return NextResponse.json({ success: false, message: 'Integration not found for platform' }, { status: 400 })
  }

  const payload = (event.original_payload as Record<string, unknown>) ?? {}
  let sendOk = false

  if (event.platform === 'meta') {
    const pixelId = integration.pixel_id
    const accessToken = integration.access_token
    if (!pixelId || !accessToken) {
      return NextResponse.json({ success: false, message: 'Meta integration missing credentials' }, { status: 400 })
    }
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    sendOk = res.ok
  } else if (event.platform === 'google') {
    return NextResponse.json({ success: false, message: 'Google retry not implemented' }, { status: 501 })
  } else {
    return NextResponse.json({ success: false, message: 'Unsupported platform' }, { status: 400 })
  }

  if (sendOk) {
    const { error: updateErr } = await serviceSupabase
      .from('events')
      .update({ status: 'recovered' })
      .eq('id', eventId)
    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Event recovered' })
  }

  const nextRetry = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const newRetryCount = (event.retry_count ?? 0) + 1
  const { error: updateErr } = await serviceSupabase
    .from('events')
    .update({ retry_count: newRetryCount, next_retry_at: nextRetry })
    .eq('id', eventId)
  if (updateErr) {
    return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 })
  }
  return NextResponse.json({ success: false, message: 'Retry failed; will retry again later' })
}

