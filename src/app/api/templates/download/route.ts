import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getEffectivePlan } from '@/lib/plans'

export const dynamic = 'force-dynamic'
import {
  TEMPLATES,
  canAccessTemplate,
} from '@/lib/templates'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: Request) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('templateId')
  if (!templateId) {
    return NextResponse.json(
      { error: 'templateId required' },
      { status: 400 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at, api_key')
    .eq('id', user.id)
    .single()

  const effectivePlan = getEffectivePlan(profile ?? {})
  const planForTemplates = effectivePlan as 'free' | 'pro' | 'agency'

  const template = TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const canAccess = canAccessTemplate(planForTemplates, template.requiredPlan)
  if (!canAccess) {
    return NextResponse.json(
      {
        error: 'Upgrade required',
        message: `This template requires ${template.requiredPlan.toUpperCase()} plan. Upgrade or start a free trial to download.`,
      },
      { status: 403 }
    )
  }

  const apiKey = profile?.api_key ?? ''
  let content: string

  const publicPath = path.join(
    process.cwd(),
    'public',
    'templates',
    template.fileName
  )
  try {
    content = await readFile(publicPath, 'utf-8')
  } catch {
    content = template.previewCode
  }

  if (apiKey) {
    content = content.replace(/YOUR_API_KEY/g, apiKey)
    content = content.replace(/\"YOUR_API_KEY\"/g, JSON.stringify(apiKey))
  }

  const filename = template.fileName
  const headers = new Headers({
    'Content-Type':
      filename.endsWith('.json')
        ? 'application/json'
        : filename.endsWith('.tpl')
          ? 'application/octet-stream'
          : 'text/plain; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  })

  return new NextResponse(content, { headers })
}

