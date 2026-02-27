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

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  const prompt = `Analyze these UTM parameters and return ONLY valid JSON with no markdown: { "original_url": string, "cleaned_url": string, "issues": string[], "normalized_utms": object, "recommendations": string[] }. URL: ${url}`

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
            'You are a UTM and URL hygiene expert. Return only valid JSON, no markdown, no backticks, no explanation.',
        },
        { role: 'user', content: prompt },
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
