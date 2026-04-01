import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminOverviewPage() {
  const supabase = await await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  // Get stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  const { count: totalPixels } = await supabase
    .from('pixels')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-3xl font-bold text-slate-900">{totalUsers ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm text-slate-500">Total Events</p>
          <p className="text-3xl font-bold text-slate-900">{totalEvents ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm text-slate-500">Total Pixels</p>
          <p className="text-3xl font-bold text-slate-900">{totalPixels ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

