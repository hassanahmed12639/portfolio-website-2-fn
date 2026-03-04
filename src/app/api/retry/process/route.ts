import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateNextRetry } from '@/lib/retry-queue'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const cronSecret = process.env.CRON_SECRET
    if (!supabaseUrl || !serviceRoleKey || !cronSecret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: jobs } = await supabase
    .from('retry_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .limit(50)

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let successCount = 0
  let failCount = 0

  for (const job of jobs) {
    await supabase
      .from('retry_queue')
      .update({ status: 'retrying', updated_at: new Date().toISOString() })
      .eq('id', job.id)

    try {
      const { data: integration } = await supabase
        .from('integrations')
        .select('pixel_id, access_token')
        .eq('user_id', job.user_id)
        .eq('platform', 'meta')
        .eq('is_active', true)
        .single()

      if (!integration) {
        await supabase
          .from('retry_queue')
          .update({
            status: 'exhausted',
            last_error: 'No active Meta integration',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)
        failCount++
        continue
      }

      const payload = job.payload as Record<string, unknown>
      const userData: Record<string, unknown> = {}
      if (payload.email && typeof payload.email === 'string') {
        userData.em = [sha256(payload.email)]
      }
      if (payload.phone && typeof payload.phone === 'string') {
        userData.ph = [sha256(payload.phone.replace(/\D/g, ''))]
      }
      if (payload.fbp) userData.fbp = payload.fbp
      if (payload.fbc) userData.fbc = payload.fbc

      const metaPayload = {
        data: [
          {
            event_name: payload.event_name,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: payload.event_source_url ?? undefined,
            user_data: userData,
            custom_data: {
              value: payload.value ?? 0,
              currency: payload.currency ?? 'USD',
            },
            event_id: payload.event_id ?? undefined,
          },
        ],
        access_token: integration.access_token,
      }

      const res = await fetch(
        `https://graph.facebook.com/v19.0/${integration.pixel_id}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload),
        }
      )

      if (res.ok) {
        await supabase
          .from('retry_queue')
          .update({ status: 'success', updated_at: new Date().toISOString() })
          .eq('id', job.id)

        if (job.event_id) {
          await supabase
            .from('events')
            .update({ status: 'success' })
            .eq('event_id', job.event_id)
            .eq('user_id', job.user_id)
            .eq('platform', 'meta')
        }

        successCount++
      } else {
        throw new Error(`Meta API returned ${res.status}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (job.attempt >= job.max_attempts) {
        await supabase
          .from('retry_queue')
          .update({
            status: 'exhausted',
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)
      } else {
        const nextAttempt = job.attempt + 1
        await supabase
          .from('retry_queue')
          .update({
            status: 'pending',
            attempt: nextAttempt,
            next_retry_at: calculateNextRetry(nextAttempt).toISOString(),
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)
      }
      failCount++
    }
  }

    return NextResponse.json({
      processed: jobs.length,
      success: successCount,
      failed: failCount,
    })
  } catch (error) {
    console.error('[retry/process] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
