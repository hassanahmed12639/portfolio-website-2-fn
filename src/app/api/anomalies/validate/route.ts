import { validateEvent } from '@/lib/validate-event'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { event?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body.event ?? body
  if (!event || typeof event !== 'object') {
    return NextResponse.json({ error: 'Provide an event object' }, { status: 400 })
  }

  const result = validateEvent(event)
  return NextResponse.json(result)
}
