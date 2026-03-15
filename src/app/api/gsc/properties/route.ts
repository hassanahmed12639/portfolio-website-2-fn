import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  decryptIfValue,
  encryptIfValue,
  fetchGscSites,
  refreshAccessToken,
} from '@/lib/gsc'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: connection } = await admin
    .from('gsc_connections')
    .select('id, google_account_email, last_synced_at, created_at, access_token, refresh_token, token_expires_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const refreshParam = new URL(request.url).searchParams.get('refresh')
  const shouldRefreshFromGoogle = refreshParam === '1'

  if (connection && shouldRefreshFromGoogle) {
    try {
      let accessToken = await decryptIfValue(connection.access_token)
      const refreshToken = await decryptIfValue(connection.refresh_token)
      const exp = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0
      const tokenExpiring = !accessToken || (exp > 0 && exp - Date.now() < 60_000)

      if (tokenExpiring && refreshToken) {
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

      if (accessToken) {
        const sites = await fetchGscSites(accessToken)
        if (sites.length > 0) {
          const rows = sites.map((s) => ({
            user_id: user.id,
            gsc_connection_id: connection.id,
            site_url: s.siteUrl,
            permission_level: s.permissionLevel ?? null,
            is_active: true,
            updated_at: new Date().toISOString(),
          }))
          await admin.from('gsc_properties').upsert(rows, { onConflict: 'user_id,site_url' })
        }
      }
    } catch {
      // Non-fatal: still return whatever is already saved in DB.
    }
  }

  const { data: properties, error } = await supabase
    .from('gsc_properties')
    .select('id, site_url, permission_level, is_selected, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('site_url', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    connected: !!connection,
    connection: connection ?? null,
    properties: properties ?? [],
  })
}
