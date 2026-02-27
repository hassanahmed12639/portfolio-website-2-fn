import { NextRequest, NextResponse } from 'next/server'

function gtmSnippet(eventName: string, payload: Record<string, unknown>): string {
  const safeName = eventName.replace(/"/g, '\\"')
  const obj: Record<string, unknown> = { event: safeName, ...payload }
  return `dataLayer.push(${JSON.stringify(obj)});`
}

function scriptSnippet(eventName: string, payload: Record<string, unknown>): string {
  const safeName = eventName.replace(/'/g, "\\'")
  return `TrackHive.track('${safeName}', ${JSON.stringify(payload)});`
}

const DEFAULT_PAYLOADS: Record<string, Record<string, unknown>> = {
  AddToCart: { value: 0, currency: 'USD' },
  InitiateCheckout: { value: 0, currency: 'USD' },
  Purchase: { value: 0, currency: 'USD', order_id: '' },
  Lead: {},
  ViewContent: { content_type: 'product' },
  Search: { search_string: '' },
  'WhatsApp Click': {},
  'Phone Click': {},
  'Email Click': {},
  'Video Watch': { content_type: 'video' },
  PageView: {},
  'Scroll Depth': { depth: 90 },
  'Button Click': { button_name: '' },
  CompleteRegistration: {},
}

function payloadFor(eventName: string): Record<string, unknown> {
  return DEFAULT_PAYLOADS[eventName] ?? {}
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const events = Array.isArray(body?.events) ? body.events : []
    const type = body?.type === 'gtm' || body?.type === 'script' ? body.type : 'gtm'

    const eventNames = events
      .map((e: unknown) => (typeof e === 'string' ? e : (e as { event?: string })?.event))
      .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0)

    const gtmLines: string[] = []
    const scriptLines: string[] = []

    for (const name of eventNames) {
      const payload = payloadFor(name)
      gtmLines.push(gtmSnippet(name, payload))
      scriptLines.push(scriptSnippet(name, payload))
    }

    const gtm_code = gtmLines.length ? gtmLines.join('\n\n') : '// No events selected'
    const script_code = scriptLines.length ? scriptLines.join('\n\n') : '// No events selected'

    return NextResponse.json({ gtm_code, script_code })
  } catch (e) {
    console.error('[scanner generate-code]', e)
    return NextResponse.json({ error: 'Generate failed' }, { status: 500 })
  }
}
