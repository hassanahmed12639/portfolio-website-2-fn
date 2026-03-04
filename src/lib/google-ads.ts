import crypto from 'crypto'

function hashData(value: string): string {
  if (!value) return ''
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function sendGoogleEnhancedConversion(
  eventName: string,
  eventData: Record<string, unknown>,
  userData: Record<string, string | undefined> & { address?: { street?: string; city?: string; region?: string; postal_code?: string; country?: string } }
) {
  const conversionId = process.env.GOOGLE_ADS_CONVERSION_ID
  const conversionLabel = process.env.GOOGLE_ADS_CONVERSION_LABEL
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const ga4ApiSecret = process.env.GA4_API_SECRET

  if (!conversionId || !conversionLabel) {
    console.log('[Google] Missing credentials, skipping')
    return { success: false, error: 'Missing credentials' }
  }

  if (!ga4MeasurementId || !ga4ApiSecret) {
    console.log('[Google] Missing GA4 Measurement Protocol credentials, skipping')
    return { success: false, error: 'Missing GA4 credentials' }
  }

  // Only send for conversion events
  const conversionEvents = ['Purchase', 'Lead', 'CompleteRegistration', 'InitiateCheckout', 'AddToCart']
  if (!conversionEvents.includes(eventName)) {
    console.log(`[Google] Skipping non-conversion event: ${eventName}`)
    return { success: true, skipped: true }
  }

  // Map event names to Google event names
  const googleEventMap: Record<string, string> = {
    Purchase: 'purchase',
    Lead: 'generate_lead',
    CompleteRegistration: 'sign_up',
    InitiateCheckout: 'begin_checkout',
    AddToCart: 'add_to_cart',
  }

  const googleEventName = googleEventMap[eventName] ?? eventName.toLowerCase()

  // Build enhanced conversion data with hashed user data
  const enhancedConversionData: Record<string, unknown> = {}
  if (userData.email) enhancedConversionData.sha256_email_address = hashData(userData.email)
  if (userData.phone) enhancedConversionData.sha256_phone_number = hashData(userData.phone)
  if (userData.first_name) enhancedConversionData.sha256_first_name = hashData(userData.first_name)
  if (userData.last_name) enhancedConversionData.sha256_last_name = hashData(userData.last_name)
  if (userData.address) {
    enhancedConversionData.address = {
      sha256_street: hashData(userData.address.street ?? ''),
      sha256_city: hashData(userData.address.city ?? ''),
      sha256_region: hashData(userData.address.region ?? ''),
      sha256_postal_code: hashData(userData.address.postal_code ?? ''),
      sha256_country: hashData(userData.address.country ?? ''),
    }
  }

  // Send via GA4 Measurement Protocol with Google Ads conversion
  const payload = {
    client_id: (eventData.client_ip_address as string) || `trackhive_${Date.now()}`,
    events: [
      {
        name: googleEventName,
        params: {
          send_to: `${conversionId}/${conversionLabel}`,
          value: eventData.value != null ? parseFloat(String(eventData.value)) : 0,
          currency: (eventData.currency as string) || 'USD',
          transaction_id: (eventData.order_id as string) || `order_${Date.now()}`,
          engagement_time_msec: 100,
          ...enhancedConversionData,
        },
      },
    ],
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4ApiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    console.log(`[Google Enhanced] Event sent: ${googleEventName} → ${res.status}`)
    return { success: res.ok, status: res.status }
  } catch (error) {
    console.error('[Google Enhanced] Error:', error)
    return { success: false, error }
  }
}
