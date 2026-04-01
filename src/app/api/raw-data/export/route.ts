import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const EXPORT_HEADERS = ['event_id', 'event_name', 'platform', 'value', 'currency', 'country', 'city', 'device_type', 'customer_type', 'status', 'created_at']

function convertToCSV(events: Record<string, unknown>[]): string {
  const rows = events.map((e) =>
    EXPORT_HEADERS.map((h) => {
      const v = e[h]
      if (v == null) return ''
      const s = String(v)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
      return s
    }).join(',')
  )
  return [EXPORT_HEADERS.join(','), ...rows].join('\n')
}

export async function GET(request: NextRequest) {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan as string) ?? 'free'
  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const platform = searchParams.get('platform') || ''
  const eventName = searchParams.get('event_name') || ''
  const format = (searchParams.get('format') || 'json').toLowerCase()
  const limitParam = searchParams.get('limit')
  const preview = limitParam === '10' || searchParams.get('preview') === '1'
  const limit = preview ? 10 : Math.min(10000, parseInt(limitParam || '10000', 10) || 10000)

  if (!preview && plan !== 'pro') {
    return NextResponse.json(
      { error: 'Raw data export is a Pro feature. Please upgrade to download full exports.' },
      { status: 403 }
    )
  }

  let query = supabase
    .from('events')
    .select('id, event_id, event_name, platform, value, country, city, device_type, customer_type, status, payload, enriched_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (fromParam) {
    const fromDate = new Date(fromParam)
    if (!isNaN(fromDate.getTime())) {
      query = query.gte('created_at', fromDate.toISOString())
    }
  }
  if (toParam) {
    const toDate = new Date(toParam)
    if (!isNaN(toDate.getTime())) {
      query = query.lte('created_at', toDate.toISOString())
    }
  }
  if (platform && platform !== 'all') {
    query = query.eq('platform', platform.toLowerCase())
  }
  if (eventName && eventName !== 'all') {
    query = query.eq('event_name', eventName)
  }

  const { data: rows, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const events = (rows ?? []).map((e) => {
    const payload = (e.payload as Record<string, unknown>) || {}
    const base = {
      event_id: e.event_id ?? e.id,
      event_name: e.event_name,
      platform: e.platform,
      value: e.value ?? 0,
      currency: payload.currency ?? 'USD',
      country: e.country ?? '',
      city: e.city ?? '',
      device_type: e.device_type ?? '',
      customer_type: e.customer_type ?? '',
      status: e.status,
      created_at: e.created_at,
    }
    if (preview && e.enriched_data) {
      return { ...base, enriched_data: e.enriched_data }
    }
    return base
  })

  if (preview) {
    return NextResponse.json({ events, plan })
  }

  const filename = `trackhive-export-${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'json'}`

  if (format === 'csv') {
    const csv = convertToCSV(events)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  return new NextResponse(JSON.stringify(events), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

