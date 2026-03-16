import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  decryptIfValue,
  encryptIfValue,
  querySearchAnalytics,
  refreshAccessToken,
} from '@/lib/gsc'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) return true
  const given = request.headers.get('x-cron-secret')
  return Boolean(given && given === expected)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createAdminClient()

  const { data: activeConnections, error } = await admin
    .from('gsc_connections')
    .select('id, user_id, last_synced_at')
    .eq('is_active', true)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    scheduled_connections: activeConnections?.length ?? 0,
    note: 'Cron endpoint is active. Use app-level job runner to call /api/gsc/sync per user/property.',
  })
}

function getDateRange(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - 1)
  const start = new Date(end)
  start.setDate(start.getDate() - Math.max(1, days - 1))
  const toIso = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: toIso(start), endDate: toIso(end) }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function dedupeByKey<T>(rows: T[], getKey: (row: T) => string): T[] {
  const map = new Map<string, T>()
  for (const row of rows) map.set(getKey(row), row)
  return Array.from(map.values())
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: connections, error } = await admin
    .from('gsc_connections')
    .select('id, user_id, access_token, refresh_token, token_expires_at')
    .eq('is_active', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { startDate, endDate } = getDateRange(7)
  let syncedUsers = 0
  let syncedRows = 0
  const failures: Array<{ user_id: string; reason: string }> = []

  for (const conn of connections ?? []) {
    try {
      let accessToken = await decryptIfValue(conn.access_token)
      const refreshToken = await decryptIfValue(conn.refresh_token)
      const exp = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0
      if ((!accessToken || (exp > 0 && exp - Date.now() < 60_000)) && refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken)
        accessToken = refreshed.access_token
        await admin
          .from('gsc_connections')
          .update({
            access_token: await encryptIfValue(refreshed.access_token),
            token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', conn.id)
      }
      if (!accessToken) throw new Error('No access token')

      const { data: properties } = await admin
        .from('gsc_properties')
        .select('id, site_url')
        .eq('user_id', conn.user_id)
        .eq('is_active', true)

      for (const property of properties ?? []) {
        const rows = await querySearchAnalytics(
          accessToken,
          property.site_url,
          startDate,
          endDate,
          ['date', 'query', 'page', 'country', 'device'],
          25000
        )
        const normalized = dedupeByKey(
          rows.map((r) => {
            const keys = r.keys ?? []
            return {
              user_id: conn.user_id,
              property_id: property.id,
              metric_date: keys[0] ?? startDate,
              query: keys[1] ?? '',
              page: keys[2] ?? '',
              country: keys[3] ?? 'all',
              device: keys[4] ?? 'all',
              clicks: Number(r.clicks ?? 0),
              impressions: Number(r.impressions ?? 0),
              ctr: Number(r.ctr ?? 0),
              position: Number(r.position ?? 0),
              updated_at: new Date().toISOString(),
            }
          }),
          (r) => `${r.user_id}__${r.property_id}__${r.metric_date}__${r.query}__${r.page}__${r.country}__${r.device}`
        )

        for (const b of chunk(normalized, 1000)) {
          const { error: upsertError } = await admin
            .from('gsc_query_page_daily')
            .upsert(b, { onConflict: 'user_id,property_id,metric_date,query,page,country,device' })
          if (upsertError) throw upsertError
        }
        syncedRows += normalized.length
      }

      await admin
        .from('gsc_connections')
        .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', conn.id)
      syncedUsers += 1
    } catch (e) {
      failures.push({ user_id: conn.user_id, reason: e instanceof Error ? e.message : 'sync failed' })
    }
  }

  return NextResponse.json({
    success: true,
    range: { startDate, endDate },
    synced_users: syncedUsers,
    synced_rows: syncedRows,
    failures,
  })
}
