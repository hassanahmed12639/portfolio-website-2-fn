import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('dashboard_type')
    .eq('id', user.id)
    .single()

  if (profile?.dashboard_type !== 'leadgen') {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)] mb-4">
          Lead Manager is available when your dashboard mode is set to Lead Generation.
        </p>
        <Link
          href="/dashboard/settings"
          className="text-[var(--dash-primary)] hover:underline font-medium"
        >
          Switch to Lead Gen in Settings →
        </Link>
      </div>
    )
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Lead Manager</h1>
      {leads?.length ? (
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Meta feedback</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: Record<string, unknown>) => (
                <tr key={String(lead.id)} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-bg)]">
                  <td className="px-4 py-3 text-[var(--dash-text)]">
                    {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">{String(lead.email ?? '—')}</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">{String(lead.score ?? '—')}</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">{String(lead.stage ?? '—')}</td>
                  <td className="px-4 py-3">{lead.meta_feedback_sent ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {lead.created_at ? new Date(String(lead.created_at)).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-sm p-8 text-center">
          <p className="text-[var(--dash-muted)]">No leads yet. Leads appear when your tracking script captures Lead events.</p>
          <Link href="/dashboard/playground" className="text-[var(--dash-primary)] hover:underline font-medium mt-2 inline-block">
            Send a test Lead event →
          </Link>
        </div>
      )}
    </div>
  )
}
