import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export type IpModification = 'full' | 'anonymized' | 'partial' | 'full_mask'

export type PrivacySettings = {
  id?: string
  user_id?: string
  ip_anonymization: boolean
  data_retention_days: number
  consent_mode: boolean
  pii_masking: boolean
  gdpr_mode: boolean
  ccpa_mode: boolean
  auto_delete_enabled: boolean
  data_minimization?: boolean
  ip_modification?: IpModification
  anonymize_email?: boolean
  anonymize_phone?: boolean
  strip_query_params?: boolean
  anonymize_user_agent?: boolean
  created_at?: string
}

const defaults: PrivacySettings = {
  ip_anonymization: true,
  data_retention_days: 90,
  consent_mode: true,
  pii_masking: true,
  gdpr_mode: false,
  ccpa_mode: false,
  auto_delete_enabled: true,
  data_minimization: false,
  ip_modification: 'anonymized',
  anonymize_email: true,
  anonymize_phone: true,
  strip_query_params: false,
  anonymize_user_agent: false,
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: row, error } = await supabase
    .from('privacy_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: PrivacySettings = row
    ? {
        ...defaults,
        ...row,
        ip_anonymization: row.ip_anonymization ?? true,
        data_retention_days: row.data_retention_days ?? 90,
        consent_mode: row.consent_mode ?? true,
        pii_masking: row.pii_masking ?? true,
        gdpr_mode: row.gdpr_mode ?? false,
        ccpa_mode: row.ccpa_mode ?? false,
        auto_delete_enabled: row.auto_delete_enabled ?? true,
        data_minimization: row.data_minimization ?? false,
        ip_modification: (row.ip_modification as PrivacySettings['ip_modification']) ?? 'anonymized',
        anonymize_email: row.anonymize_email ?? true,
        anonymize_phone: row.anonymize_phone ?? true,
        strip_query_params: row.strip_query_params ?? false,
        anonymize_user_agent: row.anonymize_user_agent ?? false,
      }
    : { ...defaults }

  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Partial<PrivacySettings>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const row = {
    user_id: user.id,
    ip_anonymization: body.ip_anonymization ?? true,
    data_retention_days: body.data_retention_days ?? 90,
    consent_mode: body.consent_mode ?? true,
    pii_masking: body.pii_masking ?? true,
    gdpr_mode: body.gdpr_mode ?? false,
    ccpa_mode: body.ccpa_mode ?? false,
    auto_delete_enabled: body.auto_delete_enabled ?? true,
    data_minimization: body.data_minimization ?? false,
    ip_modification: body.ip_modification ?? 'anonymized',
    anonymize_email: body.anonymize_email ?? true,
    anonymize_phone: body.anonymize_phone ?? true,
    strip_query_params: body.strip_query_params ?? false,
    anonymize_user_agent: body.anonymize_user_agent ?? false,
  }

  const { data: existing } = await supabase
    .from('privacy_settings')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing?.id) {
    const { data: updated, error } = await supabase
      .from('privacy_settings')
      .update(row)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(updated ?? row)
  }

  const { data: inserted, error } = await supabase
    .from('privacy_settings')
    .insert(row)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(inserted ?? row)
}
