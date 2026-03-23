export async function sendGoogleEnhancedConversion(
  eventName: string,
  body: any,
  conversionIdParam?: string,
  conversionLabelParam?: string,
  measurementIdParam?: string,
  apiSecretParam?: string
) {
  const conversionId = conversionIdParam ?? process.env.GOOGLE_ADS_CONVERSION_ID
  const conversionLabel = conversionLabelParam ?? process.env.GOOGLE_ADS_CONVERSION_LABEL
  const measurementId = measurementIdParam ?? process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const apiSecret = apiSecretParam ?? process.env.GA4_API_SECRET

  if (!measurementId || !apiSecret) {
    console.log('[Google] Missing GA4 credentials')
    return { success: false, error: 'Missing credentials' }
  }
  if (!conversionId || !conversionLabel) {
    console.log('[Google] Missing conversion ID or label')
    return { success: false, error: 'Missing conversion ID or label' }
  }

  // Fire Google Enhanced for all conversion events (no other event-type filter)
  const googleConversionEvents = [
    'Purchase',
    'Lead',
    'CompleteRegistration',
    'Subscribe',
    'Contact',
    'InitiateCheckout',
    'AddToCart',
    'AddPaymentInfo',
    'BeginCheckout',
  ]
  // Defensive: non-conversion events should not call this (route gates); no noisy "error"
  if (!googleConversionEvents.includes(eventName)) {
    return { success: false, skipped: true as const }
  }

  // Hash function
  async function hashData(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data.trim().toLowerCase())
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Build user data with hashed PII
  const userData: any = {}

  if (body.user_data?.em?.length > 0) {
    userData.sha256_email_address = await hashData(body.user_data.em[0])
  }
  if (body.user_data?.ph?.length > 0) {
    userData.sha256_phone_number = await hashData(
      body.user_data.ph[0].replace(/\D/g, '')
    )
  }
  if (body.user_data?.fn?.length > 0) {
    userData.address = {
      ...userData.address,
      sha256_first_name: await hashData(body.user_data.fn[0])
    }
  }
  if (body.user_data?.ln?.length > 0) {
    userData.address = {
      ...userData.address,
      sha256_last_name: await hashData(body.user_data.ln[0])
    }
  }

  // Build GA4 payload with Google Ads conversion
  const payload = {
    client_id: body.fbp || `th_${Date.now()}`,
    events: [
      {
        name: 'conversion',
        params: {
          send_to: `${conversionId}/${conversionLabel}`,
          value: body.value || 0,
          currency: body.currency || 'USD',
          transaction_id: body.order_id || body.event_id || `th_${Date.now()}`,
          ...userData
        }
      }
    ],
    user_data: userData
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Google Enhanced] Sending conversion:', eventName, 'to:', `${conversionId}/${conversionLabel}`)
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    if (process.env.NODE_ENV === 'development') {
      console.log('[Google Enhanced] Response:', response.status)
    }
    return { success: response.status === 204, status: response.status }
  } catch (error: any) {
    console.error('[Google Enhanced] Error:', error.message)
    return { success: false, error: error.message }
  }
}
