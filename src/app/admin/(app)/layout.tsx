import dynamicImport from 'next/dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const AdminShell = dynamicImport(
  () =>
    import('@/components/admin/AdminShell').then((m) => ({
      default: m.AdminShell,
    })),
  { ssr: false, loading: () => <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500 animate-pulse">Loading...</p></div> }
)

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/admin/login')
  }

  return <AdminShell>{children}</AdminShell>
}
