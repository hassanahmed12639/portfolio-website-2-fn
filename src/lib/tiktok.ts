import crypto from 'crypto'

function hashData(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function sendTikTokEvent(
  eventName: string,
  eventData: Record<string, unknown>,
  userData: Record<string, string | undefined>
) {
  const pixelId = process.env.TIKTOK_PIXEL_ID
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    console.log('[TikTok] Missing credentials, skipping')
    return { success: false, error: 'Missing credentials' }
  }

  // Map TrackHive event names to TikTok event names
  const tiktokEventMap: Record<string, string> = {
    Purchase: 'CompletePayment',
    PageView: 'Pageview',
    AddToCart: 'AddToCart',
    InitiateCheckout: 'InitiateCheckout',
    Lead: 'SubmitForm',
    CompleteRegistration: 'CompleteRegistration',
    Search: 'Search',
    ViewContent: 'ViewContent',
  }

  const tiktokEventName = tiktokEventMap[eventName] ?? eventName

  // Hash user data
  const hashedUser: Record<string, string[]> = {}
  if (userData.email) hashedUser.email = [hashData(userData.email)]
  if (userData.phone) hashedUser.phone_number = [hashData(userData.phone)]
  if (userData.first_name) hashedUser.first_name = [hashData(userData.first_name)]
  if (userData.last_name) hashedUser.last_name = [hashData(userData.last_name)]
  if (eventData.client_ip_address) hashedUser.ip = [String(eventData.client_ip_address)]
  if (eventData.client_user_agent) hashedUser.user_agent = [String(eventData.client_user_agent)]

  const payload = {
    data: [
      {
        event: tiktokEventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: (eventData.event_id as string) || `trackhive_${Date.now()}`,
        user: hashedUser,
        page: {
          url: (eventData.event_source_url as string) || '',
          referrer: (eventData.referrer_url as string) || '',
        },
        properties: {
          value: eventData.value != null ? parseFloat(String(eventData.value)) : undefined,
          currency: (eventData.currency as string) || 'USD',
          order_id: eventData.order_id,
          content_type: 'product',
        },
      },
    ],
    event_source: 'web',
    event_source_id: pixelId,
  }

  try {
    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(payload),
    })
    const data = (await res.json()) as { code?: number; message?: string }
    console.log(`[TikTok] Event sent: ${tiktokEventName} → ${data.code} ${data.message}`)
    return { success: data.code === 0, data }
  } catch (error) {
    console.error('[TikTok] Error:', error)
    return { success: false, error }
  }
}
