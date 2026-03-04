import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readFile } from 'fs/promises'

export const dynamic = 'force-dynamic'
import path from 'path'

const LOGS_PATH = path.join(process.cwd(), 'src', 'data', 'alert-logs.json')

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await readFile(LOGS_PATH, 'utf-8').catch(() => '[]')
  const logs = JSON.parse(raw)
  return NextResponse.json(logs)
}
