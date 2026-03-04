import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, platform, value, status, event_id, payload, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: scores } = await supabase
    .from('attribution_scores')
    .select('conversion_id, truth_score, meta_score, google_score, breakdown')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const eventsWithScores = (events ?? []).map((e) => {
    const scoreRow = (scores ?? []).find((s) => s.conversion_id === e.id)
    return {
      ...e,
      truth_score: scoreRow?.truth_score ?? null,
      meta_score: scoreRow?.meta_score ?? null,
      google_score: scoreRow?.google_score ?? null,
      breakdown: scoreRow?.breakdown ?? {},
    }
  })

  const prompt = `You are an attribution expert. Analyze these conversion events and return ONLY JSON (no markdown, no backticks):
{
  "overall_truth_score": number,
  "platform_breakdown": {
    "meta": { "score": number, "issues": [string], "recommendation": string },
    "google": { "score": number, "issues": [string], "recommendation": string }
  },
  "attribution_issues": [{ "issue": string, "impact": string, "fix": string, "priority": "high|medium|low" }],
  "data_quality": { "score": number, "missing_signals": [string], "recommendations": [string] },
  "estimated_revenue_at_risk": number,
  "summary": string
}

Event data: ${JSON.stringify(eventsWithScores)}`

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
            'You are an attribution expert. Always respond with valid JSON only. No markdown. No backticks. No explanation. Just pure JSON.',
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
