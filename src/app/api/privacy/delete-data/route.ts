import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { confirmation?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.confirmation !== 'DELETE') {
    return NextResponse.json(
      { error: 'Confirmation text must be exactly "DELETE"' },
      { status: 400 }
    )
  }

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: events, error: deleteError } = await serviceSupabase
    .from('events')
    .delete()
    .eq('user_id', user.id)
    .select('id')

  const deletedCount = Array.isArray(events) ? events.length : 0

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  await serviceSupabase
    .from('profiles')
    .update({ events_used: 0 })
    .eq('id', user.id)

  return NextResponse.json({ success: true, deleted_count: deletedCount })
}

