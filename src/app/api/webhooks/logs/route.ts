import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit } from '@/lib/request-security'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const rateLimitResponse = enforceRateLimit(req, 'webhooks-read', 60, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const webhookId = searchParams.get('webhook_id')

  let query = supabase
    .from('webhook_logs')
    .select(`
      id,
      webhook_id,
      status,
      platform_responses,
      lead_id,
      created_at,
      webhooks(name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (webhookId) query = query.eq('webhook_id', webhookId)

  const { data: logs, error } = await query

  if (error) {
    console.error('[webhook_logs] List error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const logsWithName = (logs ?? []).map((log: any) => {
    const firstWebhook = Array.isArray(log.webhooks) ? log.webhooks[0] : log.webhooks
    return {
      ...log,
      webhook_name: firstWebhook?.name ?? null,
    }
  })

  return NextResponse.json({ logs: logsWithName })
}

