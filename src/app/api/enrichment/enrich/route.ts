import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { enrichEvent } from '@/lib/enrich-event'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  let body: {
    ip?: string
    user_agent?: string
    visitor_id?: string
    email?: string
    phone?: string
    user_id?: string
    api_key?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ip = body.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
  const userAgent = body.user_agent ?? request.headers.get('user-agent') ?? ''
  const visitorId = body.visitor_id ?? null
  const email = body.email ?? null
  const phone = body.phone ?? null

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  let userId = body.user_id
  if (!userId && body.api_key) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('api_key', body.api_key)
      .single()
    userId = profile?.id ?? undefined
  }
  if (!userId) {
    return NextResponse.json({ error: 'user_id or api_key required' }, { status: 400 })
  }

  const { data: settingsRow } = await supabase
    .from('enrichment_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  const settings = settingsRow
    ? {
        geo_enabled: settingsRow.geo_enabled ?? true,
        device_enabled: settingsRow.device_enabled ?? true,
        customer_type_enabled: settingsRow.customer_type_enabled ?? true,
        ltv_enabled: settingsRow.ltv_enabled ?? true,
        email_hash_enabled: settingsRow.email_hash_enabled ?? true,
        phone_hash_enabled: settingsRow.phone_hash_enabled ?? true,
      }
    : {}

  const enriched = await enrichEvent(
    settings,
    {
      ip,
      userAgent,
      visitorId,
      email: email ?? null,
      phone: phone ?? null,
      userId,
    },
    supabase
  )

  return NextResponse.json(enriched)
}
