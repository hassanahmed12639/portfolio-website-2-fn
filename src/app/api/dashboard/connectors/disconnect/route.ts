import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { connectionId } = await request.json()
    const supabase = await await createClient()
    const supabaseAdmin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: connection } = await supabaseAdmin
      .from('ad_connections')
      .select('id')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single()

    if (!connection) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

    await supabaseAdmin
      .from('ad_connections')
      .update({ is_active: false })
      .eq('id', connectionId)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

