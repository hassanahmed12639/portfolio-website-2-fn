import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET — fetch all pixels for user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: pixels } = await supabase
    .from('pixels')
    .select('id, pixel_id, name, platform, is_active, is_primary, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan as string) || 'free'

  return NextResponse.json({ pixels: pixels || [], plan })
}

// POST — add new pixel
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { pixel_id, access_token, name, platform } = body

  if (!pixel_id || !access_token) {
    return NextResponse.json({ error: 'pixel_id and access_token required' }, { status: 400 })
  }

  // Check pixel limit based on plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('pixels')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const limits: Record<string, number> = { free: 1, pro: 3, agency: 10, trial: 3 }
  const plan = (profile?.plan as string) || 'free'
  const limit = limits[plan] ?? 1

  if ((count || 0) >= limit) {
    return NextResponse.json({
      error: `Your ${plan} plan allows ${limit} pixel(s). Upgrade to add more.`,
      upgrade_required: true,
    }, { status: 403 })
  }

  const { data: pixel, error } = await supabase
    .from('pixels')
    .insert({
      user_id: user.id,
      pixel_id: String(pixel_id).trim(),
      access_token: String(access_token).trim(),
      name: (name || 'My Pixel').trim().slice(0, 100),
      platform: (platform || 'meta').toLowerCase(),
      is_active: true,
      is_primary: (count || 0) === 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pixel })
}

// PUT — update pixel (toggle active, rename, set primary)
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  if (updates.is_primary === true) {
    await supabase
      .from('pixels')
      .update({ is_primary: false })
      .eq('user_id', user.id)
  }

  const { error } = await supabase
    .from('pixels')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — remove pixel
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('pixels')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
