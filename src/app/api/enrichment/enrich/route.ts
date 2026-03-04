import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { enrichEvent } from '@/lib/enrich-event'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const sessionClient = await createServerClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
    let body: {
      ip?: string
      user_agent?: string
      visitor_id?: string
      email?: string
      phone?: string
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

    const userId = user.id

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
  } catch (error) {
    console.error('[enrichment/enrich] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
