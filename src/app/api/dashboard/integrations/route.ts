import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('platform, pixel_id, access_token, tag_id, meta_test_event_code, conversion_label, conversion_id, ga4_measurement_id, ga4_api_secret')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ integrations: integrations ?? [] })
}

