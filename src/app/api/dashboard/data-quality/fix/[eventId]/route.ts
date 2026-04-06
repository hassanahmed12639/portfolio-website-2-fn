import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const eventId = params.eventId

    // Get the EMQ fix for this event
    const { data: fix, error } = await supabase
      .from('event_emq_fixes')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      fix: fix || null,
    })
  } catch (error) {
    console.error('Error fetching EMQ fix:', error)
    return NextResponse.json(
      { error: 'Failed to fetch EMQ fix' },
      { status: 500 }
    )
  }
}