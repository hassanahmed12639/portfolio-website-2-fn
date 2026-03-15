import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  encryptIfValue,
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
  fetchGscSites,
} from '@/lib/gsc'

export const dynamic = 'force-dynamic'

function getDashboardBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/dashboard/login', getDashboardBaseUrl()))
    }

    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    const error = request.nextUrl.searchParams.get('error')
    const stateCookie = request.cookies.get('gsc_oauth_state')?.value

    if (error) {
      return NextResponse.redirect(new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}`, getDashboardBaseUrl()))
    }
    if (!code || !state || !stateCookie || state !== stateCookie) {
      return NextResponse.redirect(new URL('/dashboard/integrations?error=invalid_state', getDashboardBaseUrl()))
    }

    const tokenData = await exchangeCodeForTokens(code)
    const accessTokenEncrypted = await encryptIfValue(tokenData.access_token)
    const refreshTokenEncrypted = await encryptIfValue(tokenData.refresh_token)
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    const googleEmail = await fetchGoogleUserEmail(tokenData.access_token)

    const { data: existingConn } = await admin
      .from('gsc_connections')
      .select('id, refresh_token')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const connectionPayload: Record<string, unknown> = {
      user_id: user.id,
      google_account_email: googleEmail,
      access_token: accessTokenEncrypted,
      token_expires_at: expiresAt,
      is_active: true,
      updated_at: new Date().toISOString(),
    }
    if (refreshTokenEncrypted) {
      connectionPayload.refresh_token = refreshTokenEncrypted
    } else if (existingConn?.refresh_token) {
      connectionPayload.refresh_token = existingConn.refresh_token
    }

    let connectionId: string
    if (existingConn?.id) {
      const { error: updateError } = await admin
        .from('gsc_connections')
        .update(connectionPayload)
        .eq('id', existingConn.id)
      if (updateError) throw updateError
      connectionId = existingConn.id
    } else {
      const { data: inserted, error: insertError } = await admin
        .from('gsc_connections')
        .insert({
          ...connectionPayload,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      if (insertError || !inserted) throw insertError ?? new Error('Failed to save GSC connection')
      connectionId = inserted.id
    }

    const sites = await fetchGscSites(tokenData.access_token)
    if (sites.length > 0) {
      const rows = sites.map((s) => ({
        user_id: user.id,
        gsc_connection_id: connectionId,
        site_url: s.siteUrl,
        permission_level: s.permissionLevel ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await admin
        .from('gsc_properties')
        .upsert(rows, { onConflict: 'user_id,site_url' })
      if (upsertError) throw upsertError

      const { data: selected } = await admin
        .from('gsc_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_selected', true)
        .limit(1)

      if (!selected || selected.length === 0) {
        const preferredHost = (() => {
          try {
            return new URL(getDashboardBaseUrl()).hostname
          } catch {
            return null
          }
        })()
        const preferred = preferredHost
          ? sites.find((s) => s.siteUrl.includes(preferredHost))
          : null
        const siteToSelect = preferred?.siteUrl ?? sites[0]?.siteUrl
        if (siteToSelect) {
          await admin.from('gsc_properties').update({ is_selected: false }).eq('user_id', user.id)
          await admin
            .from('gsc_properties')
            .update({ is_selected: true })
            .eq('user_id', user.id)
            .eq('site_url', siteToSelect)
        }
      }
    }

    const response = NextResponse.redirect(new URL('/dashboard/integrations?connected=1', getDashboardBaseUrl()))
    response.cookies.set('gsc_oauth_state', '', { maxAge: 0, path: '/' })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth callback failed'
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(message)}`, getDashboardBaseUrl())
    )
  }
}
