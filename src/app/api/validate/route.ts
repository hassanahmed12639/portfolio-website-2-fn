import { NextRequest, NextResponse } from 'next/server'
import { validatePayload } from '@/lib/payload-validator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = validatePayload(body)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}
