import crypto from 'crypto'

function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex')
}

export async function sendTikTokEvent(
  eventName: string,
  body: {
    client_ip_address?: string
    client_user_agent?: string
    event_source_url?: string
    value?: number
    currency?: string
    order_id?: string
    event_id?: string
    ttclid?: string
    content_ids?: string[]
    content_type?: string
    content_name?: string
    brand?: string
    user_data?: {
      em?: string[]
      ph?: string[]
      external_id?: string[] | string
    }
    external_id?: string
  },
  req?: { headers?: { get: (name: string) => string | null } },
  pixelIdParam?: string,
  accessTokenParam?: string
) {
  const pixelId = pixelIdParam ?? process.env.TIKTOK_PIXEL_ID
  const accessToken = accessTokenParam ?? process.env.TIKTOK_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    return { success: false, error: 'TikTok credentials missing' }
  }

  // Map event names to TikTok standard events
  const eventMap: Record<string, string> = {
    Purchase: 'CompletePayment',
    AddToCart: 'AddToCart',
    InitiateCheckout: 'InitiateCheckout',
    ViewContent: 'ViewContent',
    Lead: 'SubmitForm',
    CompleteRegistration: 'CompleteRegistration',
    Search: 'Search',
    PageView: 'Pageview',
    Subscribe: 'Subscribe',
    Contact: 'Contact',
  }

  const tiktokEventName = eventMap[eventName] || eventName

  // Get IP and user agent
  const ip =
    body.client_ip_address ||
    req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req?.headers?.get('x-real-ip') ||
    '127.0.0.1'

  const userAgent = body.client_user_agent || req?.headers?.get('user-agent') || ''

  // Get ttclid from body
  const ttclid = body.ttclid || undefined

  // Build user data with ALL parameters
  const userData: Record<string, string> = {
    ip,
    user_agent: userAgent,
  }

  // Email — hashed
  if (body.user_data?.em?.length) {
    const email = body.user_data.em[0]
    userData.email = hashData(email)
  }

  // Phone — hashed
  if (body.user_data?.ph?.length) {
    const phone = body.user_data.ph[0].replace(/\D/g, '')
    userData.phone_number = hashData(phone)
  }

  // External ID — hashed
  const extId =
    body.external_id ??
    (Array.isArray(body.user_data?.external_id) ? body.user_data.external_id[0] : body.user_data?.external_id)
  if (extId) {
    userData.external_id = hashData(typeof extId === 'string' ? extId : String(extId))
  }

  // ttclid — not hashed
  if (ttclid) {
    userData.ttclid = ttclid
  }

  // Build properties with ALL parameters
  const properties: Record<string, unknown> = {
    event_source_url: body.event_source_url || '',
  }

  if (body.value != null) properties.value = parseFloat(String(body.value))
  if (body.currency) properties.currency = body.currency
  if (body.order_id) properties.order_id = body.order_id

  if (body.content_ids?.length) {
    properties.content_id = body.content_ids[0]
  }
  if (body.content_type) properties.content_type = body.content_type
  if (body.content_name) properties.content_name = body.content_name
  if (body.brand) properties.brand = body.brand

  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: tiktokEventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id || `th_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        user: userData,
        properties,
        page: {
          url: body.event_source_url || '',
        },
      },
    ],
    ...(process.env.TIKTOK_TEST_EVENT_CODE && { test_event_code: process.env.TIKTOK_TEST_EVENT_CODE }),
  }

  try {
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as { code?: number; message?: string }
    if (process.env.NODE_ENV === 'development') {
      console.log('[TikTok] Event sent:', tiktokEventName, '→', data.code, data.message)
    }

    return {
      success: data.code === 0,
      code: data.code,
      message: data.message,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[TikTok] Error:', message)
    return { success: false, error: message }
  }
}
