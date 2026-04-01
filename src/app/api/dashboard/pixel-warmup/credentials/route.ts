import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('platform, pixel_id, meta_test_event_code, ga4_measurement_id, ga4_api_secret')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const metaRow = integrations?.find((row) => row.platform === 'meta')
  const ga4Row = integrations?.find((row) => row.platform === 'ga4')

  return NextResponse.json({
    ga4: ga4Row
      ? {
          measurementId: ga4Row.ga4_measurement_id ?? null,
        }
      : null,
    meta: metaRow
      ? {
          pixelId: metaRow.pixel_id ?? null,
          testEventCode: metaRow.meta_test_event_code ?? null,
        }
      : null,
  })
}
