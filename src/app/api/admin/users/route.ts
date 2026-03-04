import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { ok: false as const, status: 403 }
  return { ok: true as const, admin }
}

export async function GET() {
  try {
    const result = await verifyAdmin()
    if (!result.ok) return NextResponse.json({ error: result.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: result.status })
    const { admin } = result
    const { data: users } = await admin
      .from('profiles')
      .select('id, email, plan, created_at')
      .order('created_at', { ascending: false })
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('[admin/users] GET failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await verifyAdmin()
    if (!result.ok) return NextResponse.json({ error: result.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: result.status })
    const { admin } = result
    const { userId, plan } = await req.json()
    if (!userId || !plan) {
      return NextResponse.json({ error: 'userId and plan required' }, { status: 400 })
    }
    const validPlans = ['free', 'trial', 'pro', 'agency']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    const { error } = await admin.from('profiles').update({ plan }).eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/users] PUT failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const result = await verifyAdmin()
    if (!result.ok) return NextResponse.json({ error: result.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: result.status })
    const { admin } = result
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await admin.from('profiles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/users] DELETE failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
