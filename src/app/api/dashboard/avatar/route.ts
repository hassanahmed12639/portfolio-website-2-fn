import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const BUCKET = 'avatars'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    // Ensure bucket exists (create if not)
    const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880,
    })
    const alreadyExists =
      bucketError?.message?.toLowerCase().includes('already exists') ||
      bucketError?.message?.includes('BucketAlreadyExists') ||
      bucketError?.message?.includes('ResourceAlreadyExists')
    if (bucketError && !alreadyExists) {
      console.error('[Avatar] Bucket create error:', bucketError)
      return NextResponse.json({ error: bucketError.message }, { status: 500 })
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const filePath = `${user.id}/avatar.${fileExt}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[Avatar] Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl

    await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        avatar_type: 'image',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Avatar] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
