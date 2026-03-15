import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !webhook) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ webhook })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = String(body.name).trim()
  if (body.event_name !== undefined) updates.event_name = body.event_name
  if (body.event_value !== undefined) updates.event_value = Number(body.event_value)
  if (body.pixel_ids !== undefined) updates.pixel_ids = Array.isArray(body.pixel_ids) ? body.pixel_ids : []
  if (body.field_map !== undefined) updates.field_map = body.field_map && typeof body.field_map === 'object' ? body.field_map : {}
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active)

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[webhooks] Update error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ webhook })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[webhooks] Delete error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
