import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  let body: { events?: unknown[]; uploadedLog?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const events = Array.isArray(body.events) ? body.events : []
  const uploadedLog = typeof body.uploadedLog === 'string' ? body.uploadedLog : ''
  const payload = events.length > 0 ? events : (uploadedLog ? { rawLog: uploadedLog } : null)

  if (!payload) {
    return NextResponse.json(
      { error: 'Provide events array or uploadedLog string' },
      { status: 400 }
    )
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert digital marketing tracking analyst. Always respond with valid JSON only. No markdown. No backticks. No explanation. Just pure JSON.',
        },
        {
          role: 'user',
          content: `Analyze this tracking event data and return ONLY this exact JSON structure with no extra text:
{
  "health_score": number between 0-100,
  "missing_events": [{ "event": "string", "reason": "string", "priority": "high" }],
  "duplicate_events": [{ "event": "string", "count": 0, "fix": "string" }],
  "events_missing_value": [{ "event": "string", "count": 0, "impact": "string" }],
  "funnel_analysis": [{ "stage": "string", "count": 0, "dropoff_percent": 0 }],
  "recommendations": [{ "title": "string", "description": "string", "code_snippet": "string", "impact": "high" }],
  "quick_win": { "title": "string", "description": "string", "code_snippet": "string" },
  "summary": "string"
}
Event data: ${JSON.stringify(payload)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    return NextResponse.json(
      { error: 'Groq request failed', details: errText },
      { status: 502 }
    )
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid Groq response' }, { status: 502 })
  }

  const cleaned = content.replace(/```json|```/g, '').trim()
  let result: unknown
  try {
    result = JSON.parse(cleaned)
  } catch {
    return NextResponse.json(
      { error: 'AI returned invalid JSON', raw: cleaned.slice(0, 500) },
      { status: 502 }
    )
  }

  return NextResponse.json(result)
}
