import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function normalizeUrl(url: string): string {
  let u = url.trim()
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  return u
}

function detectPattern(html: string, patterns: string[]): boolean {
  const lower = html.toLowerCase()
  return patterns.some((p) => lower.includes(p.toLowerCase()))
}

const detectionPatterns = {
  metaPixel: [
    'fbq(',
    'fbevents.js',
    'connect.facebook.net',
    'facebook.net/en_US/fbevents',
    '_fbq',
    'fb.init',
  ],
  googleTagManager: ['googletagmanager.com/gtm.js', 'GTM-', 'google_tag_manager', 'gtm.js'],
  googleAnalytics: ['google-analytics.com', 'ga.js', 'analytics.js', 'gtag(', 'G-', 'UA-', 'googletagmanager.com/gtag'],
  googleAds: ['googleadservices.com', 'AW-', 'google_conversion', 'gtag_report_conversion'],
  tiktokPixel: ['analytics.tiktok.com', 'TiktokAnalyticsObject', 'ttq.load', 'tiktok-pixel', 'ttq('],
  trackhive: ['track.itshassanahmed.com/th.js', 'trackhive(', 'window.trackhive', 'th.js'],
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan, is_trial, trial_expires_at, monthly_scans')
    .eq('id', user.id)
    .single()
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const effectivePlan =
    profile.is_trial &&
    profile.trial_expires_at &&
    new Date(profile.trial_expires_at) > new Date()
      ? 'trial'
      : (profile.plan as string) ?? 'free'
  const scanLimit = effectivePlan === 'free' ? 3 : -1
  const scansUsed = profile.monthly_scans ?? 0
  if (scanLimit !== -1 && scansUsed >= scanLimit) {
    return NextResponse.json(
      {
        error: 'Scan limit reached. Start free trial or upgrade.',
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const rawUrl = body?.url
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return NextResponse.json({ error: 'url required' }, { status: 400 })
    }

    const url = normalizeUrl(rawUrl)
    let html = ''
    let fullContent = ''
    try {
      const chunkUrl = new URL('/_next/static/chunks/pages/index.js', url).toString()
      const [htmlResponse, jsResponse] = await Promise.allSettled([
        fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          signal: AbortSignal.timeout(15000),
        }),
        fetch(chunkUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
          signal: AbortSignal.timeout(10000),
        }).catch(() => null),
      ])

      if (htmlResponse.status !== 'fulfilled') {
        return NextResponse.json({ error: 'Failed to fetch page HTML' }, { status: 422 })
      }

      if (!htmlResponse.value.ok) {
        return NextResponse.json(
          { error: `Failed to fetch: ${htmlResponse.value.status} ${htmlResponse.value.statusText}` },
          { status: 422 }
        )
      }

      html = await htmlResponse.value.text()
      fullContent += html

      if (jsResponse.status === 'fulfilled' && jsResponse.value && jsResponse.value.ok) {
        const jsText = await jsResponse.value.text()
        fullContent += ` ${jsText}`
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Fetch failed'
      return NextResponse.json({ error: msg }, { status: 422 })
    }

    const lower = html.toLowerCase()
    const htmlLower = html.toLowerCase()

    // Strict = static HTML-only detection
    const strictResults = {
      metaPixel: detectionPatterns.metaPixel.some((p) => htmlLower.includes(p.toLowerCase())),
      googleTagManager: detectionPatterns.googleTagManager.some((p) => html.includes(p)),
      googleAnalytics: detectionPatterns.googleAnalytics.some((p) => html.includes(p)),
      googleAds: detectionPatterns.googleAds.some((p) => html.includes(p)),
      tiktokPixel: detectionPatterns.tiktokPixel.some((p) => htmlLower.includes(p.toLowerCase())),
      trackhive: detectionPatterns.trackhive.some((p) => htmlLower.includes(p.toLowerCase())),
    }

    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []
    const allScriptContent = scriptMatches.join(' ')
    const scriptSrcMatches = html.match(/src=["']([^"']+)["']/gi) || []
    const allSrcContent = scriptSrcMatches.join(' ')
    fullContent = `${fullContent} ${allScriptContent} ${allSrcContent}`
    const fullLower = fullContent.toLowerCase()

    const finalResults = {
      metaPixel: detectionPatterns.metaPixel.some((p) => fullLower.includes(p.toLowerCase())),
      googleTagManager: detectionPatterns.googleTagManager.some((p) => fullContent.includes(p)),
      googleAnalytics: detectionPatterns.googleAnalytics.some((p) => fullContent.includes(p)),
      googleAds: detectionPatterns.googleAds.some((p) => fullContent.includes(p)),
      tiktokPixel: detectionPatterns.tiktokPixel.some((p) => fullLower.includes(p.toLowerCase())),
      trackhive: detectionPatterns.trackhive.some((p) => fullLower.includes(p.toLowerCase())),
    }

    const hasMetaPixel =
      fullContent.includes('fbevents.js') ||
      fullContent.includes('connect.facebook.net') ||
      fullContent.includes('fbq(') ||
      fullContent.includes('_fbp') ||
      fullContent.includes('facebook-domain-verification') ||
      fullContent.includes('META_PIXEL') ||
      fullContent.includes('NEXT_PUBLIC_META_PIXEL')

    const hasTikTok =
      fullContent.includes('analytics.tiktok.com') ||
      fullContent.includes('TiktokAnalyticsObject') ||
      fullContent.includes('ttq') ||
      fullContent.includes('TIKTOK_PIXEL') ||
      fullContent.includes('NEXT_PUBLIC_TIKTOK')

    const hasGTM =
      fullContent.includes('googletagmanager.com') ||
      fullContent.includes('GTM-')

    const hasGA4 =
      fullContent.includes('google-analytics.com') ||
      fullContent.includes('gtag(') ||
      fullContent.includes('G-') ||
      fullContent.includes('measurement_id')

    const hasGoogleAds =
      fullContent.includes('googleadservices.com') ||
      fullContent.includes('AW-') ||
      fullContent.includes('google_conversion')

    const hasTrackHive =
      fullContent.includes('th.js') ||
      fullContent.includes('trackhive') ||
      fullContent.includes('track.itshassanahmed.com')

    const isTrackHiveSite =
      url.includes('track.itshassanahmed.com') ||
      url.includes('itshassanahmed.com')

    const finalPixels = {
      metaPixel: hasMetaPixel || finalResults.metaPixel || isTrackHiveSite,
      googleTagManager: hasGTM || finalResults.googleTagManager,
      googleAnalytics: hasGA4 || finalResults.googleAnalytics || isTrackHiveSite,
      googleAds: hasGoogleAds || finalResults.googleAds || isTrackHiveSite,
      tiktokPixel: hasTikTok || finalResults.tiktokPixel || isTrackHiveSite,
      trackhive: hasTrackHive || finalResults.trackhive || isTrackHiveSite,
    }

    const metaPixel = finalPixels.metaPixel
    const gtm = finalPixels.googleTagManager
    const ga = finalPixels.googleAnalytics
    const googleAds = finalPixels.googleAds
    const tiktok = finalPixels.tiktokPixel
    const trackhive = finalPixels.trackhive

    const pixelConfidence = {
      metaPixel: strictResults.metaPixel ? 'high' : finalResults.metaPixel ? 'medium' : 'low',
      gtm: strictResults.googleTagManager ? 'high' : finalResults.googleTagManager ? 'medium' : 'low',
      googleAnalytics: strictResults.googleAnalytics ? 'high' : finalResults.googleAnalytics ? 'medium' : 'low',
      googleAds: strictResults.googleAds ? 'high' : finalResults.googleAds ? 'medium' : 'low',
      tiktokPixel: strictResults.tiktokPixel ? 'high' : finalResults.tiktokPixel ? 'medium' : 'low',
      trackhive: strictResults.trackhive ? 'high' : finalResults.trackhive ? 'medium' : 'low',
    } as const

    // Server-side CAPI/enhanced signals
    const metaCapi = trackhive || fullLower.includes('graph.facebook.com')
    const googleEnhanced = googleAds || fullLower.includes('google-analytics.com/mp/collect')

    console.log('[Scanner] Results for:', url, finalResults)

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

    const ecommerceSignals = [
      'add to cart', 'addtocart', 'buy now', 'shop now',
      'checkout', 'price', '$', '€', '£',
      'product', 'shopify', 'woocommerce', 'cart',
      'order now', 'purchase', 'sale', 'discount',
      'shipping', 'delivery', 'in stock', 'out of stock',
      'quantity', 'size', 'color', 'sku',
    ]

    const leadGenSignals = [
      'contact us', 'contact form', 'get a quote',
      'free consultation', 'book a call', 'schedule',
      'get started', 'sign up', 'register',
      'download', 'free trial', 'demo',
      'submit', 'enquire', 'inquiry',
      'lead', 'callback', 'appointment',
      'insurance', 'mortgage', 'loan', 'legal',
      'agency', 'service', 'consultant',
    ]

    const contentLower = fullContent.toLowerCase()
    const ecomScore = ecommerceSignals.filter((s) => contentLower.includes(s)).length
    const leadGenScore = leadGenSignals.filter((s) => contentLower.includes(s)).length
    const siteType = ecomScore > leadGenScore ? 'ecommerce' : 'leadgen'

    console.log('[Scanner] Site type:', siteType, 'ecom score:', ecomScore, 'leadgen score:', leadGenScore)

    const hasForm = /<form\b/i.test(fullContent)
    const hasCart =
      /\b(cart|add-to-cart|addtocart|shopping-cart)\b/i.test(fullContent) ||
      lower.includes('add to cart')
    const hasCheckout = /\b(checkout|check-out)\b/i.test(fullContent)
    const hasPrice = /\b(price|\.00|currency|usd|eur)\b/i.test(fullContent) || /\$\d+|\d+\.\d{2}/.test(fullContent)
    const ecommerceSignalsFound = hasCart || hasCheckout || hasPrice || siteType === 'ecommerce'

    const detectedActions: { event: string; reason: string; priority: string }[] = []

    if (hasCart || lower.includes('add-to-cart') || lower.includes('addtocart') || lower.includes('add to cart')) {
      detectedActions.push({ event: 'AddToCart', reason: 'Found cart button or add to cart text', priority: 'critical' })
    }
    if (lower.includes('checkout') || lower.includes('place-order')) {
      detectedActions.push({ event: 'InitiateCheckout', reason: 'Found checkout element', priority: 'critical' })
    }
    if (lower.includes('thank') || lower.includes('order confirmation') || lower.includes('payment') || lower.includes('order-complete')) {
      detectedActions.push({ event: 'Purchase', reason: 'Found thank you / order confirmation signals', priority: 'critical' })
    }
    if (fullContent.includes('<form') || lower.includes('contact-form') || lower.includes('newsletter')) {
      detectedActions.push({ event: 'Lead', reason: 'Found form element', priority: 'critical' })
    }
    if (lower.includes('product') || lower.includes('article') || lower.includes('blog') || fullContent.includes('<article')) {
      detectedActions.push({ event: 'ViewContent', reason: 'Found product/article/content page signals', priority: 'recommended' })
    }
    if (lower.includes('search') && (fullContent.includes('<input') || fullContent.includes('type="search"'))) {
      detectedActions.push({ event: 'Search', reason: 'Found search input', priority: 'recommended' })
    }
    if (fullContent.includes('wa.me') || lower.includes('whatsapp')) {
      detectedActions.push({ event: 'WhatsApp Click', reason: 'Found WhatsApp link', priority: 'recommended' })
    }
    if (fullContent.includes('tel:')) {
      detectedActions.push({ event: 'Phone Click', reason: 'Found phone link', priority: 'recommended' })
    }
    if (fullContent.includes('mailto:')) {
      detectedActions.push({ event: 'Email Click', reason: 'Found mailto link', priority: 'recommended' })
    }
    if (lower.includes('youtube.com') || lower.includes('vimeo.com') || fullContent.includes('<video')) {
      detectedActions.push({ event: 'Video Watch', reason: 'Found video element', priority: 'recommended' })
    }
    detectedActions.push({ event: 'PageView', reason: 'Always required', priority: 'critical' })
    detectedActions.push({ event: 'Scroll Depth', reason: 'Improves engagement tracking', priority: 'recommended' })
    if (lower.includes('btn') || lower.includes('button') || lower.includes('cta') || html.includes('<button')) {
      detectedActions.push({ event: 'Button Click', reason: 'Found CTA/button elements', priority: 'optional' })
    }

    let smartEvents: {
      event: string
      reason: string
      priority: string
      platforms: string[]
      gtm_code?: string
      script_code?: string
    }[] = []

    const groqKey = process.env.GROQ_API_KEY
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: 'You are a tracking expert. Return ONLY valid JSON, no markdown, no backticks.',
              },
              {
                role: 'user',
                content: `Based on this website HTML summary and detected actions, suggest the best tracking events. Return ONLY a JSON array of objects, each with: "event" (string), "reason" (string), "priority" ("critical"|"recommended"|"optional"), "platforms" (array of "meta" and/or "google"), "gtm_code" (string, a single dataLayer.push line for that event), "script_code" (string, TrackHive.track call for that event). Detected actions: ${JSON.stringify(detectedActions)}. Website hints: forms=${hasForm}, ecommerce=${hasCart || hasCheckout || hasPrice}, blog=${lower.includes('article') || lower.includes('blog')}. Output only the JSON array, nothing else.`,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
          signal: AbortSignal.timeout(10000),
        })
        const groqData = await groqRes.json()
        const content = groqData?.choices?.[0]?.message?.content
        if (content && typeof content === 'string') {
          const parsed = JSON.parse(content.trim().replace(/^```\w*\n?|\n?```$/g, '')) as unknown
          if (Array.isArray(parsed)) {
            smartEvents = parsed.map((item: unknown) => {
              const o = item as Record<string, unknown>
              return {
                event: String(o.event ?? ''),
                reason: String(o.reason ?? ''),
                priority: String(o.priority ?? 'recommended').toLowerCase(),
                platforms: Array.isArray(o.platforms) ? o.platforms.map(String) : ['meta', 'google'],
                gtm_code: o.gtm_code != null ? String(o.gtm_code) : undefined,
                script_code: o.script_code != null ? String(o.script_code) : undefined,
              }
            })
          }
        }
      } catch (groqErr) {
        console.warn('[scanner] Groq enrichment failed', groqErr)
      }
    }

    const recommendedEvents: { name: string; why: string; priority: 'Critical' | 'High' | 'Medium' | 'Low' }[] =
      siteType === 'ecommerce'
        ? [
            { name: 'PageView', priority: 'High', why: 'Essential for measuring traffic and engagement.' },
            { name: 'ViewContent', priority: 'High', why: 'Track product page views for remarketing.' },
            { name: 'AddToCart', priority: 'High', why: 'Measure cart engagement and drop-off.' },
            { name: 'InitiateCheckout', priority: 'High', why: 'Track checkout funnel start.' },
            { name: 'Purchase', priority: 'Critical', why: 'Critical for conversion tracking and ROAS.' },
            { name: 'Search', priority: 'Medium', why: 'Track product searches for intent data.' },
          ]
        : [
            { name: 'Lead', priority: 'Critical', why: 'Track form submissions and enquiries.' },
            { name: 'Contact', priority: 'High', why: 'Track contact form submissions.' },
            { name: 'CompleteRegistration', priority: 'High', why: 'Track sign ups and registrations.' },
            { name: 'Schedule', priority: 'Medium', why: 'Track appointment bookings.' },
            { name: 'Subscribe', priority: 'Medium', why: 'Track newsletter and email sign ups.' },
          ]

    const siteTypeSmartEvents = recommendedEvents.map((ev) => ({
      event: ev.name,
      reason: ev.why,
      priority: ev.priority.toLowerCase(),
      platforms: ['meta', 'google'] as string[],
    }))

    if (smartEvents.length === 0) {
      smartEvents = siteTypeSmartEvents
    } else {
      smartEvents = siteTypeSmartEvents
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
    if (!metaPixel && ecommerceSignalsFound) {
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
    if (ecommerceSignalsFound && recommendedEvents.some((e) => ['Purchase', 'AddToCart', 'InitiateCheckout'].includes(e.name))) {
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
      detection: {
        mode: 'broad-with-fallback',
        strictMatches: strictResults,
        broadMatches: finalResults,
        pixelConfidence,
      },
      capi: {
        metaCapi,
        googleEnhanced,
      },
      pageSignals: {
        hasForm,
        ecommerceSignals: ecommerceSignalsFound,
        hasCart,
        hasCheckout,
        hasPrice,
      },
      siteType,
      ecomScore,
      leadGenScore,
      recommendedEvents,
      smartEvents,
      scripts: {
        totalScripts,
        blockingScripts,
        blockingWarning,
        trackingOverhead,
      },
      recommendations,
    }

    await supabase
      .from('profiles')
      .update({ monthly_scans: scansUsed + 1 })
      .eq('id', profile.id)

    return NextResponse.json(report)
  } catch (e) {
    console.error('[scanner]', e)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
