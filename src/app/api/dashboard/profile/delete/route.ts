import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user from auth (admin only) – cascades to profiles if RLS/triggers are set up
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
