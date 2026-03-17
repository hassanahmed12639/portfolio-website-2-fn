import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCookieName, verifySessionToken } from '@/lib/portfolio-auth'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const BUCKET = 'portfolio-assets'
const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function deny(message: string, status = 401) {
  return NextResponse.json({ error: message }, { status })
}

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = rateLimit(`portfolio-admin-upload:${ip}`, { windowMs: 60_000, maxRequests: 30 })
  if (!rate.success) return deny('Too many requests', 429)

  const token = request.cookies.get(getCookieName())?.value
  if (!token || !verifySessionToken(token)) return deny('Unauthorized', 401)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectSlugRaw = (formData.get('projectSlug') as string | null) ?? 'general'

    if (!file) return deny('No file provided', 400)
    if (!ALLOWED_TYPES.includes(file.type)) return deny('Only JPG, PNG, and WebP are allowed', 400)
    if (file.size > MAX_SIZE) return deny('Image must be under 8MB', 400)

    const projectSlug = sanitizeSlug(projectSlugRaw || 'general') || 'general'
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 10)
    const path = `${projectSlug}/${timestamp}-${random}.${ext}`

    const admin = createAdminClient()
    const { error: bucketError } = await admin.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ALLOWED_TYPES,
      fileSizeLimit: MAX_SIZE,
    })
    const bucketExists =
      bucketError?.message?.toLowerCase().includes('already exists') ||
      bucketError?.message?.includes('BucketAlreadyExists') ||
      bucketError?.message?.includes('ResourceAlreadyExists')
    if (bucketError && !bucketExists) {
      throw new Error(bucketError.message)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw new Error(uploadError.message)

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl, path })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
