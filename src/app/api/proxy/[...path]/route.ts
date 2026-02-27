import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const DESTINATIONS: Record<string, string> = {
  fb: 'https://connect.facebook.net/en_US/fbevents.js',
  'meta-capi': 'https://graph.facebook.com',
  gtm: 'https://www.googletagmanager.com/gtm.js',
  gads: 'https://googleadservices.com',
  th: 'https://track.itshassanahmed.com/th.js',
}

function getDestination(pathSegments: string[]): string | null {
  const slug = pathSegments[0]
  const base = DESTINATIONS[slug]
  if (!base) return null
  if (slug === 'meta-capi' || slug === 'gads') {
    const rest = pathSegments.slice(1).join('/')
    const baseUrl = base.replace(/\/$/, '')
    return rest ? `${baseUrl}/${rest}` : baseUrl
  }
  return base
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  if (!pathSegments?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 })
  }

  const destination = getDestination(pathSegments)
  if (!destination) {
    return NextResponse.json({ error: 'Unknown proxy route' }, { status: 404 })
  }

  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const targetUrl = query ? `${destination}?${query}` : destination

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'connection') return
    headers.set(key, value)
  })
  headers.set('Host', new URL(destination).host)

  let res: Response
  try {
    res = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })
  } catch (e) {
    return NextResponse.json({ error: 'Proxy fetch failed' }, { status: 502 })
  }

  const contentType = res.headers.get('content-type') ?? 'application/javascript'
  const body = await res.arrayBuffer()

  const nextHeaders = new Headers()
  nextHeaders.set('Content-Type', contentType)
  nextHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      await supabase.from('proxy_logs').insert({
        path: pathSegments.join('/'),
        destination: destination,
      })
    } catch {
      // ignore if table missing or insert fails
    }
  }

  return new NextResponse(body, {
    status: res.status,
    headers: nextHeaders,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  if (!pathSegments?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 })
  }

  const slug = pathSegments[0]
  const base = DESTINATIONS[slug]
  if (!base) {
    return NextResponse.json({ error: 'Unknown proxy route' }, { status: 404 })
  }

  const rest = pathSegments.slice(1).join('/')
  const baseUrl = base.replace(/\/$/, '')
  const destination = rest ? `${baseUrl}/${rest}` : baseUrl

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'connection') return
    headers.set(key, value)
  })
  headers.set('Host', new URL(destination).host)

  const body = await request.text()
  let res: Response
  try {
    res = await fetch(destination, {
      method: 'POST',
      headers,
      body: body || undefined,
    })
  } catch {
    return NextResponse.json({ error: 'Proxy fetch failed' }, { status: 502 })
  }

  const responseBody = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') ?? 'application/json'
  const nextHeaders = new Headers()
  nextHeaders.set('Content-Type', contentType)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      await supabase.from('proxy_logs').insert({
        path: pathSegments.join('/'),
        destination: destination,
      })
    } catch {}
  }

  return new NextResponse(responseBody, {
    status: res.status,
    headers: nextHeaders,
  })
}
