import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { ok: false as const, status: 403 }
  return { ok: true as const, admin }
}

export async function GET() {
  try {
    const result = await verifyAdmin()
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const { data: posts } = await admin
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error('[admin/blog] GET failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await verifyAdmin()
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const body = await req.json()
    const { data, error } = await admin
      .from('blog_posts')
      .insert([body])
      .select()
      .single()
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('[admin/blog] POST failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await verifyAdmin()
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const { id, ...body } = await req.json()
    const { data, error } = await admin
      .from('blog_posts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('[admin/blog] PUT failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const result = await verifyAdmin()
    if (!result.ok)
      return NextResponse.json(
        { error: result.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: result.status }
      )
    const { admin } = result
    const { id } = await req.json()
    if (!id)
      return NextResponse.json(
        { error: 'id required' },
        { status: 400 }
      )
    await admin.from('blog_posts').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/blog] DELETE failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
