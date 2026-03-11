export function getMetaCookies(): { fbc: string | null; fbp: string | null } {
  if (typeof document === 'undefined') return { fbc: null, fbp: null }
  const fbcMatch = document.cookie.match(/_fbc=([^;]+)/)
  const fbpMatch = document.cookie.match(/_fbp=([^;]+)/)
  return {
    fbc: fbcMatch ? fbcMatch[1] : sessionStorage.getItem('_fbc'),
    fbp: fbpMatch ? fbpMatch[1] : sessionStorage.getItem('_fbp'),
  }
}

export function generateEventId(eventName: string): string {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Fire a Meta event to both the browser pixel and CAPI with the same eventID for deduplication.
 * Always passes fbc and fbp from cookies. For Lead, Purchase, InitiateCheckout also pass
 * email, phone, external_id in userData when available for 9/10+ match quality.
 */
export async function fireMetaEvent(
  eventName: string,
  customData: Record<string, unknown> = {},
  userData: Record<string, unknown> = {}
) {
  const { fbc, fbp } = getMetaCookies()
  const eventId = generateEventId(eventName)
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  // Fire pixel with eventID for deduplication
  if (typeof window !== 'undefined' && (window as unknown as { fbq?: (a: string, b: string, c?: unknown, d?: { eventID?: string }) => void }).fbq) {
    (window as unknown as { fbq: (a: string, b: string, c?: unknown, d?: { eventID?: string }) => void }).fbq('track', eventName, customData, { eventID: eventId })
  }

  // Fire CAPI with same eventID
  try {
    await fetch('/api/track/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_source_url: window.location.href,
        event_id: eventId,
        pixel_id: pixelId,
        user_data: {
          fbc: fbc || undefined,
          fbp: fbp || undefined,
          ...userData,
        },
        custom_data: customData,
      }),
    })
  } catch (err) {
    console.error('Meta CAPI error:', err)
  }
}
