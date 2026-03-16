import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserCredentials } from '@/lib/get-user-credentials'

export const dynamic = 'force-dynamic'

async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(data.trim().toLowerCase())
  )
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { leadId, score } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })

    const supabaseAdmin = createAdminClient()
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const credentials = await getUserCredentials(user.id)
    const pixelId = credentials.metaPixelId || process.env.META_PIXEL_ID
    const accessToken = credentials.metaAccessToken || process.env.META_ACCESS_TOKEN

    if (!pixelId || !accessToken) {
      return NextResponse.json(
        { error: 'Meta credentials not found' },
        { status: 400 }
      )
    }

    const scoreMap: Record<string, { event: string; value: number }> = {
      good: { event: 'qualified_lead', value: 50 },
      bad: { event: 'bad_lead', value: 0 },
      hot: { event: 'hot_lead', value: 75 },
      converted: {
        event: 'Purchase',
        value: typeof lead.value === 'number' ? lead.value : 100
      }
    }

    const metaEvent = scoreMap[score]
    if (!metaEvent) return NextResponse.json({ success: true, skipped: true })

    const userData: Record<string, string[]> = {}
    if (lead.email) userData.em = [await hashData(String(lead.email))]
    if (lead.phone)
      userData.ph = [
        await hashData(String(lead.phone).replace(/\D/g, ''))
      ]

    const payload = {
      data: [
        {
          event_name: metaEvent.event,
          event_time: Math.floor(Date.now() / 1000),
          event_id: `feedback_${leadId}_${Date.now()}`,
          action_source: 'website',
          user_data: userData,
          custom_data: {
            value: metaEvent.value,
            currency: lead.currency || 'USD',
            lead_score: score
          }
        }
      ]
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    const data = await response.json()
    console.log('[Meta Feedback] Sent:', score, '→', data)

    // When score is 'converted', also send Google Ads conversion via GA4 Measurement Protocol
    if (score === 'converted') {
      const measurementId =
        credentials.ga4MeasurementId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
      const apiSecret = credentials.ga4ApiSecret || process.env.GA4_API_SECRET
      const conversionId =
        credentials.googleConversionId || process.env.GOOGLE_ADS_CONVERSION_ID
      const conversionLabel =
        credentials.googleConversionLabel || process.env.GOOGLE_ADS_CONVERSION_LABEL

      if (measurementId && apiSecret) {
        const sendTo =
          conversionId && conversionLabel
            ? `${conversionId}/${conversionLabel}`
            : undefined
        const googlePayload = {
          client_id: lead.email || `lead_${leadId}`,
          events: [
            {
              name: 'conversion',
              params: {
                ...(sendTo && { send_to: sendTo }),
                value: lead.value ?? 100,
                currency: lead.currency || 'USD',
                transaction_id: `lead_converted_${leadId}`
              }
            }
          ],
          user_data: {
            ...(lead.email && {
              sha256_email_address: await hashData(lead.email)
            }),
            ...(lead.phone && {
              sha256_phone_number: await hashData(
                String(lead.phone).replace(/\D/g, '')
              )
            })
          }
        }

        try {
          const googleRes = await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(googlePayload)
            }
          )
          console.log(
            '[Google Feedback] Conversion sent for converted lead:',
            googleRes.status
          )
        } catch (err) {
          console.error('[Google Feedback] Error:', err)
        }
      }
    }

    const now = new Date().toISOString()
    await supabaseAdmin
      .from('leads')
      .update({
        meta_feedback_sent: true,
        meta_feedback_at: now,
        meta_feedback_failed: false
      })
      .eq('id', leadId)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, metaResponse: data, meta_feedback_at: now })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    console.error('[Meta Feedback] Error:', message)
    try {
      const supabaseAuth = await createClient()
      const { data: { user: authUser } } = await supabaseAuth.auth.getUser()
      if (authUser) {
        const supabaseAdmin = createAdminClient()
        await supabaseAdmin
          .from('leads')
          .update({ meta_feedback_failed: true })
          .eq('user_id', authUser.id)
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
