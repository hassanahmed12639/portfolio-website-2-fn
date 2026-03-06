/** Map TrackHive event names to GA4 event names. Exported for use in event route. */
export const ga4EventMap: Record<string, string> = {
  PageView: 'page_view',
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
  Lead: 'generate_lead',
  CompleteRegistration: 'sign_up',
  Subscribe: 'subscribe',
  Contact: 'contact',
  Search: 'search',
  CustomEvent: 'custom_event',
}

export function getGA4EventName(eventName: string): string {
  return ga4EventMap[eventName] ?? eventName.toLowerCase().replace(/\s+/g, '_')
}

export async function sendGA4Event(
  eventName: string,
  eventData: Record<string, unknown>,
  userEmail?: string,
  measurementIdParam?: string,
  apiSecretParam?: string
) {
  const debugLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') console.log(...args)
  }
  const measurementId = measurementIdParam ?? process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const apiSecret = apiSecretParam ?? process.env.GA4_API_SECRET

  if (!measurementId || !apiSecret) {
    debugLog('[GA4] Missing credentials, skipping')
    return { success: false, error: 'Missing credentials' }
  }

  // ALL events fire — no event-type restriction.
  const ga4EventName = getGA4EventName(eventName)

  // Build GA4 event params
  const params: Record<string, unknown> = {
    engagement_time_msec: 100,
  }

  if (eventData.value != null) params.value = parseFloat(String(eventData.value))
  if (eventData.currency != null) params.currency = eventData.currency || 'USD'
  if (eventData.order_id != null) params.transaction_id = eventData.order_id
  if (eventData.event_source_url != null) params.page_location = eventData.event_source_url

  // User properties for enhanced matching
  const userProperties: Record<string, { value: string }> = {}
  if (userEmail) userProperties.email = { value: userEmail }

  const payload = {
    client_id:
      (eventData.fbp as string) ||
      (eventData.client_ip_address as string) ||
      `trackhive_${Date.now()}`,
    events: [{ name: ga4EventName, params }],
    user_properties: Object.keys(userProperties).length > 0 ? userProperties : undefined,
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    debugLog(`[GA4] Event sent: ${ga4EventName} → ${res.status}`)
    return { success: res.ok, status: res.status }
  } catch (error) {
    console.error('[GA4] Error:', error)
    return { success: false, error }
  }
}
