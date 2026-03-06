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

  // Map TrackHive event names to GA4 event names
  const ga4EventMap: Record<string, string> = {
    Purchase: 'purchase',
    PageView: 'page_view',
    AddToCart: 'add_to_cart',
    InitiateCheckout: 'begin_checkout',
    Lead: 'generate_lead',
    CompleteRegistration: 'sign_up',
    Search: 'search',
    ViewContent: 'view_item',
  }

  const ga4EventName = ga4EventMap[eventName] ?? eventName.toLowerCase()

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
