import { createClient } from '@/lib/supabase/server'
import { EMQAutoFixEngine, type EventData } from '@/lib/emq-auto-fix'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }

    // Get the original event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Extract event data for EMQ processing
    const eventData: EventData = {
      email: event.payload?.email,
      phone: event.payload?.phone,
      first_name: event.payload?.first_name,
      last_name: event.payload?.last_name,
      city: event.city,
      state: event.state,
      zip: event.zip,
      country: event.country,
      external_id: event.payload?.external_id,
      fbp: event.fbp,
      fbc: event.fbc,
      client_ip_address: event.ip,
      client_user_agent: event.payload?.client_user_agent,
    }

    // Run EMQ fix
    const emqResult = EMQAutoFixEngine.fix(eventData)

    // Update the event with fixed data
    const updateData: Record<string, any> = {
      data_quality_score: emqResult.score,
      data_quality_label: emqResult.score >= 9 ? 'Excellent' : emqResult.score >= 7 ? 'Good' : emqResult.score >= 5 ? 'Fair' : 'Poor',
      data_quality_breakdown: {
        email: !!emqResult.fixed_event.email,
        phone: !!emqResult.fixed_event.phone,
        fbp: !!emqResult.fixed_event.fbp,
        fbc: !!emqResult.fixed_event.fbc,
        name: !!(emqResult.fixed_event.first_name && emqResult.fixed_event.last_name),
        location: !!(emqResult.fixed_event.city || emqResult.fixed_event.state || emqResult.fixed_event.zip || emqResult.fixed_event.country),
        fbclid: !!event.fbclid,
      },
    }

    // Update fields if they were fixed
    if (emqResult.fixed_event.fbp && !event.fbp) updateData.fbp = emqResult.fixed_event.fbp
    if (emqResult.fixed_event.fbc && !event.fbc) updateData.fbc = emqResult.fixed_event.fbc

    await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .eq('user_id', user.id)

    // Store or update EMQ fix result
    const { data: existingFix } = await supabase
      .from('event_emq_fixes')
      .select('id')
      .eq('event_id', eventId)
      .single()

    if (existingFix) {
      // Update existing fix
      await supabase
        .from('event_emq_fixes')
        .update({
          score: emqResult.score,
          fixed_fields: emqResult.fixed_fields,
          suggested_fields: emqResult.suggested_fields,
          original_event: emqResult.original_event,
          fixed_event: emqResult.fixed_event,
        })
        .eq('event_id', eventId)
    } else {
      // Insert new fix
      await supabase
        .from('event_emq_fixes')
        .insert({
          event_id: eventId,
          user_id: user.id,
          score: emqResult.score,
          fixed_fields: emqResult.fixed_fields,
          suggested_fields: emqResult.suggested_fields,
          original_event: emqResult.original_event,
          fixed_event: emqResult.fixed_event,
        })
    }

    return NextResponse.json({
      success: true,
      emqResult,
      message: 'Event fixed successfully',
    })
  } catch (error) {
    console.error('EMQ manual fix error:', error)
    return NextResponse.json(
      { error: 'Failed to fix event' },
      { status: 500 }
    )
  }
}