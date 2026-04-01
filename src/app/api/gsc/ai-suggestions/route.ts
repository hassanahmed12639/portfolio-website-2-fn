import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groqApiKey = process.env.GROQ_API_KEY
  if (!groqApiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

  let body: { page?: string; keyword?: string; context?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const page = body.page?.trim()
  const keyword = body.keyword?.trim()
  if (!page || !keyword) {
    return NextResponse.json({ error: 'page and keyword are required' }, { status: 400 })
  }

  const prompt = `Generate SEO content suggestions for page ${page} targeting keyword "${keyword}".
Return strict JSON with:
{
  "title_suggestion": "string",
  "meta_description": "string",
  "h2_suggestions": ["string"],
  "faq_suggestions": [{"q":"string","a":"string"}],
  "internal_link_ideas": ["string"]
}
Context: ${body.context ?? ''}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO content strategist. Return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return NextResponse.json(
      { error: (data as { error?: { message?: string } }).error?.message ?? 'AI request failed' },
      { status: 500 }
    )
  }
  const content = (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content
  if (!content) return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 })

  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw: String(content).slice(0, 500) }, { status: 502 })
  }
}

