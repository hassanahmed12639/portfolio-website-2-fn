import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeGscSiteUrl } from '@/lib/gsc'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { site_url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const siteUrl = normalizeGscSiteUrl(body.site_url ?? '')
  if (!siteUrl) {
    return NextResponse.json({ error: 'site_url is required' }, { status: 400 })
  }

  const { data: connection } = await admin
    .from('gsc_connections')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!connection) {
    return NextResponse.json({ error: 'GSC not connected' }, { status: 400 })
  }

  const { data: exists } = await admin
    .from('gsc_properties')
    .select('id')
    .eq('user_id', user.id)
    .eq('site_url', siteUrl)
    .eq('is_active', true)
    .maybeSingle()

  if (!exists) {
    const { error: insertError } = await admin
      .from('gsc_properties')
      .insert({
        user_id: user.id,
        gsc_connection_id: connection.id,
        site_url: siteUrl,
        permission_level: null,
        is_selected: false,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  await admin.from('gsc_properties').update({ is_selected: false }).eq('user_id', user.id)
  const { error } = await admin
    .from('gsc_properties')
    .update({ is_selected: true })
    .eq('user_id', user.id)
    .eq('site_url', siteUrl)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, site_url: siteUrl })
}
