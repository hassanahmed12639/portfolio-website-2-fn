import { NextRequest, NextResponse } from 'next/server'

function normalizeUrl(url: string): string {
  let u = url.trim()
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  return u
}

function detectPattern(html: string, patterns: string[]): boolean {
  const lower = html.toLowerCase()
  return patterns.some((p) => lower.includes(p.toLowerCase()))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawUrl = body?.url
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return NextResponse.json({ error: 'url required' }, { status: 400 })
    }

    const url = normalizeUrl(rawUrl)
    let html: string
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; TrackHiveScanner/1.0)',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch: ${res.status} ${res.statusText}` },
          { status: 422 }
        )
      }
      html = await res.text()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Fetch failed'
      return NextResponse.json({ error: msg }, { status: 422 })
    }

    const lower = html.toLowerCase()

    const metaPixel = detectPattern(html, ['fbq', 'connect.facebook.net'])
    const gtm = detectPattern(html, ['googletagmanager.com'])
    const ga = detectPattern(html, ['gtag', 'analytics.js'])
    const googleAds = detectPattern(html, ['googleadservices.com'])
    const tiktok = detectPattern(html, ['analytics.tiktok.com'])
    const trackhive = detectPattern(html, ['track.itshassanahmed.com/th.js'])

    const metaCapi = trackhive
    const googleEnhanced = false

    const scriptTagRegex = /<script\b[^>]*>/gi
    const scriptTags = html.match(scriptTagRegex) ?? []
    const totalScripts = scriptTags.length
    const blockingScripts = scriptTags.filter((tag) => {
      const t = tag.toLowerCase()
      return !t.includes('async') && !t.includes('defer')
    }).length
    const blockingWarning = blockingScripts > 5
    const deductBlocking = blockingScripts > 5 ? (blockingScripts - 5) * 10 : 0

    let score = 0
    if (metaPixel) score += 15
    if (gtm) score += 15
    if (trackhive) score += 25
    if (ga) score += 10
    if (metaCapi) score += 20
    if (googleAds) score += 10
    score = Math.max(0, Math.min(100, score - deductBlocking))

    const hasForm = /<form\b/i.test(html)
    const hasCart =
      /\b(cart|add-to-cart|addtocart|shopping-cart)\b/i.test(html) ||
      lower.includes('add to cart')
    const hasCheckout = /\b(checkout|check-out)\b/i.test(html)
    const hasPrice = /\b(price|\.00|currency|usd|eur)\b/i.test(html) || /\$\d+|\d+\.\d{2}/.test(html)
    const ecommerceSignals = hasCart || hasCheckout || hasPrice

    const recommendedEvents: { name: string; why: string; priority: 'High' | 'Medium' | 'Low' }[] = []
    recommendedEvents.push({
      name: 'PageView',
      why: 'Essential for measuring traffic and engagement.',
      priority: 'High',
    })
    recommendedEvents.push({
      name: 'ViewContent',
      why: 'Tracks content views for attribution and remarketing.',
      priority: 'High',
    })
    if (ecommerceSignals) {
      recommendedEvents.push({
        name: 'Purchase',
        why: 'Critical for conversion tracking and ROAS.',
        priority: 'High',
      })
      recommendedEvents.push({
        name: 'AddToCart',
        why: 'Measures cart engagement and drop-off.',
        priority: 'High',
      })
      recommendedEvents.push({
        name: 'InitiateCheckout',
        why: 'Tracks checkout funnel start.',
        priority: 'High',
      })
    }
    if (hasForm) {
      recommendedEvents.push({
        name: 'Lead',
        why: 'Captures form submissions for lead tracking.',
        priority: 'High',
      })
      recommendedEvents.push({
        name: 'CompleteRegistration',
        why: 'Tracks sign-up and registration completions.',
        priority: 'Medium',
      })
    }

    const missingCount = recommendedEvents.length
    const summary =
      score >= 80
        ? 'Your tracking setup looks solid.'
        : score >= 50
          ? `Your tracking setup could be improved. Consider adding ${missingCount} recommended event(s).`
          : `Your tracking setup is missing ${missingCount} critical event(s).`

    const recommendations: { text: string; priority: 'Critical' | 'Important' | 'Suggested' }[] = []
    if (!trackhive) {
      recommendations.push({
        text: 'Install TrackHive snippet for server-side CAPI and unified tracking.',
        priority: 'Critical',
      })
    }
    if (!metaPixel && ecommerceSignals) {
      recommendations.push({
        text: 'Add Meta Pixel for Facebook/Instagram conversion tracking.',
        priority: 'Critical',
      })
    }
    if (!metaCapi && metaPixel) {
      recommendations.push({
        text: 'Enable Meta CAPI via TrackHive to improve match rates and deduplication.',
        priority: 'Important',
      })
    }
    if (!gtm) {
      recommendations.push({
        text: 'Consider Google Tag Manager to manage all tags in one place.',
        priority: 'Suggested',
      })
    }
    if (blockingWarning) {
      recommendations.push({
        text: `Reduce blocking scripts (${blockingScripts} found). Add async or defer to non-critical scripts.`,
        priority: 'Important',
      })
    }
    if (ecommerceSignals && recommendedEvents.some((e) => ['Purchase', 'AddToCart', 'InitiateCheckout'].includes(e.name))) {
      recommendations.push({
        text: 'Implement Purchase, AddToCart, and InitiateCheckout events for full ecommerce attribution.',
        priority: 'Important',
      })
    }
    if (recommendations.length === 0) {
      recommendations.push({
        text: 'Keep monitoring your tracking health and add events as you launch new features.',
        priority: 'Suggested',
      })
    }

    const trackingOverhead = totalScripts > 20 ? 'High' : totalScripts > 10 ? 'Medium' : 'Low'

    const report = {
      url,
      score,
      summary,
      pixels: {
        metaPixel,
        gtm,
        googleAnalytics: ga,
        googleAds,
        tiktokPixel: tiktok,
        trackhive,
      },
      capi: {
        metaCapi,
        googleEnhanced,
      },
      pageSignals: {
        hasForm,
        ecommerceSignals,
        hasCart,
        hasCheckout,
        hasPrice,
      },
      recommendedEvents,
      scripts: {
        totalScripts,
        blockingScripts,
        blockingWarning,
        trackingOverhead,
      },
      recommendations,
    }

    return NextResponse.json(report)
  } catch (e) {
    console.error('[scanner]', e)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
