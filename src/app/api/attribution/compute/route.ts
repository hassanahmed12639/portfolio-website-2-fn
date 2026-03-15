import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  AttributionModelKey,
  computeAttributionForUser,
  ensureConversionsFact,
  ensureTouchpointsFact,
} from '@/lib/attribution'

export const dynamic = 'force-dynamic'

const ALLOWED_MODELS: AttributionModelKey[] = [
  'last_click',
  'first_click',
  'linear',
  'position_based',
  'time_decay',
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { model_key?: AttributionModelKey; days?: number }
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const modelKey = body.model_key ?? 'last_click'
  if (!ALLOWED_MODELS.includes(modelKey)) {
    return NextResponse.json({ error: 'Invalid model_key' }, { status: 400 })
  }

  const days = Math.min(Math.max(Number(body.days ?? 90), 1), 730)
  const conversionsSeeded = await ensureConversionsFact(user.id, days)
  const touchpointsSeeded = await ensureTouchpointsFact(user.id, days)
  const result = await computeAttributionForUser(user.id, modelKey)

  return NextResponse.json({
    success: true,
    model_key: modelKey,
    seeded: { conversions: conversionsSeeded, touchpoints: touchpointsSeeded },
    computed: result,
  })
}
