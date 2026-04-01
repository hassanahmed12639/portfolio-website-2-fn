import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  decryptIfValue,
  querySearchAnalytics,
  refreshAccessToken,
  encryptIfValue,
  normalizeGscSiteUrl,
} from '@/lib/gsc'

export const dynamic = 'force-dynamic'

type SearchRow = {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

function getDateRange(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - 1) // GSC has delay; stop at yesterday
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
  for (const row of rows) {
    map.set(getKey(row), row)
  }
  return Array.from(map.values())
}

type QueryDailyRow = {
  user_id: string
  property_id: string
  metric_date: string
  query: string
  page: string
  country: string
  device: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  updated_at: string
}

function normalizeText(value: string) {
  return value.trim()
}

function aggregateQueryRows(rows: QueryDailyRow[]): QueryDailyRow[] {
  const map = new Map<
    string,
    { base: QueryDailyRow; clicks: number; impressions: number; weightedCtr: number; weightedPosition: number }
  >()
  for (const row of rows) {
    const key = `${row.user_id}__${row.property_id}__${row.metric_date}__${row.query}__${row.page}__${row.country}__${row.device}`
    const current = map.get(key)
    if (!current) {
      const impressionsWeight = Math.max(1, row.impressions)
      map.set(key, {
        base: row,
        clicks: row.clicks,
        impressions: row.impressions,
        weightedCtr: row.ctr * impressionsWeight,
        weightedPosition: row.position * impressionsWeight,
      })
      continue
    }

    const impressionsWeight = Math.max(1, row.impressions)
    current.clicks += row.clicks
    current.impressions += row.impressions
    current.weightedCtr += row.ctr * impressionsWeight
    current.weightedPosition += row.position * impressionsWeight
  }

  return Array.from(map.values()).map((v) => {
    const impressionsWeight = Math.max(1, v.impressions)
    return {
      ...v.base,
      clicks: v.clicks,
      impressions: v.impressions,
      ctr: v.weightedCtr / impressionsWeight,
      position: v.weightedPosition / impressionsWeight,
      updated_at: new Date().toISOString(),
    }
  })
}

export async function POST(request: NextRequest) {
  let debugContext: { userId?: string; property?: string; days?: number } = {}
  try {
    const supabase = await await createClient()
    const admin = createAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { days?: number; site_url?: string }
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const days = Number.isFinite(body.days) ? Math.min(Math.max(Number(body.days), 1), 490) : 30
    const { startDate, endDate } = getDateRange(days)
    debugContext.days = days

    const { data: connection } = await admin
      .from('gsc_connections')
      .select('id, access_token, refresh_token, token_expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!connection) {
      return NextResponse.json({ error: 'GSC not connected' }, { status: 400 })
    }

    const requestedSite = normalizeGscSiteUrl(body.site_url ?? '')
    let property: { id: string; site_url: string } | null = null

    if (requestedSite) {
      const { data: existingRequested } = await admin
        .from('gsc_properties')
        .select('id, site_url')
        .eq('user_id', user.id)
        .eq('site_url', requestedSite)
        .eq('is_active', true)
        .maybeSingle()

      if (existingRequested) {
        property = existingRequested
      } else {
        const { data: inserted, error: insertError } = await admin
          .from('gsc_properties')
          .insert({
            user_id: user.id,
            gsc_connection_id: connection.id,
            site_url: requestedSite,
            permission_level: null,
            is_selected: false,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .select('id, site_url')
          .single()
        if (insertError || !inserted) {
          return NextResponse.json({ error: insertError?.message ?? 'Failed to set property' }, { status: 400 })
        }
        property = inserted
      }

      await admin.from('gsc_properties').update({ is_selected: false }).eq('user_id', user.id)
      await admin
        .from('gsc_properties')
        .update({ is_selected: true })
        .eq('user_id', user.id)
        .eq('site_url', property.site_url)
    } else {
      const { data: selectedProperty } = await admin
        .from('gsc_properties')
        .select('id, site_url')
        .eq('user_id', user.id)
        .eq('is_selected', true)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()
      property = selectedProperty
    }

    if (!property) {
      return NextResponse.json({ error: 'No selected GSC property' }, { status: 400 })
    }
    debugContext.property = property.site_url
    debugContext.userId = user.id

    let accessToken = await decryptIfValue(connection.access_token)
    const refreshToken = await decryptIfValue(connection.refresh_token)

    if (!refreshToken && !accessToken) {
      return NextResponse.json({ error: 'Missing GSC tokens. Reconnect required.' }, { status: 400 })
    }

    const exp = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0
    const shouldRefresh = !accessToken || (exp > 0 && exp - Date.now() < 60_000)
    if (shouldRefresh && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      accessToken = refreshed.access_token
      const encryptedAccess = await encryptIfValue(refreshed.access_token)
      const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
      await admin
        .from('gsc_connections')
        .update({
          access_token: encryptedAccess,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id)
    }
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 400 })
    }

    const keywordRows = await querySearchAnalytics(
      accessToken,
      property.site_url,
      startDate,
      endDate,
      ['date', 'query', 'page', 'country', 'device'],
      25000
    )

    const pageRows = await querySearchAnalytics(
      accessToken,
      property.site_url,
      startDate,
      endDate,
      ['date', 'page', 'country', 'device'],
      25000
    )

    const normalized: QueryDailyRow[] = keywordRows.map((r: SearchRow) => {
      const keys = r.keys ?? []
      return {
        user_id: user.id,
        property_id: property.id,
        metric_date: keys[0] ?? startDate,
        query: normalizeText(keys[1] ?? ''),
        page: normalizeText(keys[2] ?? ''),
        country: normalizeText(keys[3] ?? 'all') || 'all',
        device: normalizeText(keys[4] ?? 'all') || 'all',
        clicks: Number(r.clicks ?? 0),
        impressions: Number(r.impressions ?? 0),
        ctr: Number(r.ctr ?? 0),
        position: Number(r.position ?? 0),
        updated_at: new Date().toISOString(),
      }
    })

    const dedupedNormalized = aggregateQueryRows(normalized)

    if (dedupedNormalized.length > 0) {
      const batches = chunk(dedupedNormalized, 1000)
      for (const b of batches) {
        const { error } = await admin
          .from('gsc_query_page_daily')
          .upsert(b, {
            onConflict: 'user_id,property_id,metric_date,query,page,country,device',
          })
        if (error) throw error
      }
    }

    // Prefer native page-level rows from GSC. If absent, derive from keyword rows.
    let pageDailyRows: Array<{
      user_id: string
      property_id: string
      metric_date: string
      page: string
      clicks: number
      impressions: number
      ctr: number
      avg_position: number
      updated_at: string
    }> = []

    if (pageRows.length > 0) {
      pageDailyRows = pageRows.map((r) => {
        const keys = r.keys ?? []
        const clicks = Number(r.clicks ?? 0)
        const impressions = Number(r.impressions ?? 0)
        return {
          user_id: user.id,
          property_id: property.id,
          metric_date: keys[0] ?? startDate,
          page: keys[1] ?? '',
          clicks,
          impressions,
          ctr: Number(r.ctr ?? (impressions > 0 ? clicks / impressions : 0)),
          avg_position: Number(r.position ?? 0),
          updated_at: new Date().toISOString(),
        }
      })
    } else {
      const aggMap = new Map<string, { metric_date: string; page: string; clicks: number; impressions: number; positionWeighted: number }>()
      for (const r of normalized) {
        const key = `${r.metric_date}__${r.page}`
        const existing = aggMap.get(key)
        const clicks = Number(r.clicks)
        const impressions = Number(r.impressions)
        const weightedPos = Number(r.position) * Math.max(1, impressions)
        if (!existing) {
          aggMap.set(key, {
            metric_date: r.metric_date,
            page: r.page,
            clicks,
            impressions,
            positionWeighted: weightedPos,
          })
        } else {
          existing.clicks += clicks
          existing.impressions += impressions
          existing.positionWeighted += weightedPos
        }
      }
      pageDailyRows = Array.from(aggMap.values()).map((v) => {
        const avgPosition = v.impressions > 0 ? v.positionWeighted / v.impressions : 0
        const ctr = v.impressions > 0 ? v.clicks / v.impressions : 0
        return {
          user_id: user.id,
          property_id: property.id,
          metric_date: v.metric_date,
          page: v.page,
          clicks: v.clicks,
          impressions: v.impressions,
          ctr,
          avg_position: avgPosition,
          updated_at: new Date().toISOString(),
        }
      })
    }

    const dedupedPageDailyRows = dedupeByKey(
      pageDailyRows,
      (r) => `${r.user_id}__${r.property_id}__${r.metric_date}__${r.page}`
    )

    if (dedupedPageDailyRows.length > 0) {
      for (const b of chunk(dedupedPageDailyRows, 1000)) {
        const { error } = await admin.from('gsc_page_daily').upsert(b, {
          onConflict: 'user_id,property_id,metric_date,page',
        })
        if (error) throw error
      }
    }

    await admin
      .from('gsc_connections')
      .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', connection.id)

    return NextResponse.json({
      success: true,
      site_url: property.site_url,
      synced_rows: dedupedNormalized.length,
      synced_keyword_rows: dedupedNormalized.length,
      synced_page_rows: dedupedPageDailyRows.length,
      synced_pages: dedupedPageDailyRows.length,
      note:
        normalized.length === 0
          ? 'No keyword rows returned by Google for this property/date range. Try full 16-month backfill or select a sc-domain property.'
          : null,
      range: { startDate, endDate },
    })
  } catch (error) {
    const anyErr = error as { message?: string; details?: string; hint?: string; code?: string } | null
    const message =
      (error instanceof Error ? error.message : null) ||
      (typeof error === 'string' ? error : null) ||
      anyErr?.message ||
      anyErr?.details ||
      anyErr?.hint ||
      'Sync failed'
    console.error('[gsc/sync] Failed', {
      message,
      code: anyErr?.code,
      details: anyErr?.details,
      hint: anyErr?.hint,
      context: debugContext,
    })
    return NextResponse.json(
      {
        error: message || 'Sync failed',
        code: anyErr?.code ?? null,
        details: anyErr?.details ?? null,
        hint: anyErr?.hint ?? null,
      },
      { status: 400 }
    )
  }
}

