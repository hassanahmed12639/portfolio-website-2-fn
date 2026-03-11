'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan } from '@/hooks/usePlan'
import { UpgradeModal } from '@/components/UpgradeModal'

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Dashboard',
    description: 'Start from scratch and add your own widgets',
    icon: '➕',
    color: 'border-slate-200',
    widgets: [] as string[],
  },
  {
    id: 'agency',
    name: 'Agency Report',
    description: 'Total spend, ROAS by platform, top campaigns overview',
    icon: '🏢',
    color: 'border-blue-200 bg-blue-50',
    widgets: ['total_spend', 'roas_by_platform', 'top_campaigns', 'impressions', 'clicks', 'ctr'],
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce',
    description: 'Revenue, ROAS trend, cost per purchase, best ads',
    icon: '🛒',
    color: 'border-green-200 bg-green-50',
    widgets: ['total_spend', 'total_roas', 'total_conversions', 'cpc', 'top_campaigns', 'spend_by_platform'],
  },
  {
    id: 'leadgen',
    name: 'Lead Generation',
    description: 'Cost per lead, total leads, best converting campaigns',
    icon: '🎯',
    color: 'border-purple-200 bg-purple-50',
    widgets: ['total_spend', 'total_conversions', 'cpl', 'top_campaigns', 'clicks', 'ctr'],
  },
  {
    id: 'media_buyer',
    name: 'Media Buyer',
    description: 'Spend vs budget, CTR by platform, campaign health',
    icon: '📊',
    color: 'border-orange-200 bg-orange-50',
    widgets: ['total_spend', 'ctr', 'cpc', 'cpm', 'impressions', 'top_campaigns'],
  },
]

const WIDGET_TYPES = [
  { id: 'total_spend', name: 'Total Spend', icon: '💰', type: 'metric' },
  { id: 'total_roas', name: 'Average ROAS', icon: '📈', type: 'metric' },
  { id: 'total_conversions', name: 'Total Conversions', icon: '🎯', type: 'metric' },
  { id: 'impressions', name: 'Total Impressions', icon: '👁️', type: 'metric' },
  { id: 'clicks', name: 'Total Clicks', icon: '🖱️', type: 'metric' },
  { id: 'ctr', name: 'Average CTR', icon: '📊', type: 'metric' },
  { id: 'cpc', name: 'Average CPC', icon: '💵', type: 'metric' },
  { id: 'cpm', name: 'Average CPM', icon: '📣', type: 'metric' },
  { id: 'cpl', name: 'Cost Per Lead', icon: '🧲', type: 'metric' },
  { id: 'top_campaigns', name: 'Top Campaigns Table', icon: '🏆', type: 'table' },
  { id: 'spend_by_platform', name: 'Spend by Platform', icon: '🥧', type: 'chart' },
  { id: 'roas_by_platform', name: 'ROAS by Platform', icon: '📊', type: 'chart' },
]

export default function CustomDashboardsPage() {
  const { plan } = usePlan()
  const isPro = plan === 'pro' || plan === 'agency'
  const supabase = createClient()

  const [dashboards, setDashboards] = useState<any[]>([])
  const [activeDashboard, setActiveDashboard] = useState<any>(null)
  const [widgets, setWidgets] = useState<any[]>([])
  const [campaignData, setCampaignData] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newDashName, setNewDashName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [showWidgetPicker, setShowWidgetPicker] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboards()
    fetchCampaignData()
  }, [])

  async function fetchDashboards() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('custom_dashboards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setDashboards(data || [])
    if (data && data.length > 0 && !activeDashboard) {
      setActiveDashboard(data[0])
      fetchWidgets(data[0].id)
    }
    setLoading(false)
  }

  async function fetchWidgets(dashboardId: string) {
    const { data } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('position', { ascending: true })
    setWidgets(data || [])
  }

  async function fetchCampaignData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('user_id', user.id)
    setCampaignData(data || [])
  }

  async function createDashboard() {
    if (!isPro) { setShowUpgrade(true); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !newDashName.trim()) return

    const { data: dash } = await supabase
      .from('custom_dashboards')
      .insert({ user_id: user.id, name: newDashName, template_type: selectedTemplate })
      .select()
      .single()

    if (dash) {
      const template = TEMPLATES.find(t => t.id === selectedTemplate)
      if (template && template.widgets.length > 0) {
        const widgetRows = template.widgets.map((wId, i) => {
          const wDef = WIDGET_TYPES.find(w => w.id === wId)
          return {
            dashboard_id: dash.id,
            widget_type: wDef?.type || 'metric',
            title: wDef?.name || wId,
            metric: wId,
            position: i,
            width: wDef?.type === 'table' || wDef?.type === 'chart' ? 'full' : 'quarter',
          }
        })
        await supabase.from('dashboard_widgets').insert(widgetRows)
      }
      setActiveDashboard(dash)
      fetchWidgets(dash.id)
      fetchDashboards()
      setShowCreate(false)
      setNewDashName('')
    }
  }

  async function addWidget(widgetDef: (typeof WIDGET_TYPES)[0]) {
    if (!activeDashboard) return
    const { data } = await supabase
      .from('dashboard_widgets')
      .insert({
        dashboard_id: activeDashboard.id,
        widget_type: widgetDef.type,
        title: widgetDef.name,
        metric: widgetDef.id,
        position: widgets.length,
        width: widgetDef.type === 'table' || widgetDef.type === 'chart' ? 'full' : 'quarter',
      })
      .select()
      .single()
    if (data) {
      setWidgets(prev => [...prev, data])
      setShowWidgetPicker(false)
    }
  }

  async function removeWidget(widgetId: string) {
    await supabase.from('dashboard_widgets').delete().eq('id', widgetId)
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
  }

  function getMetricValue(metric: string, platformFilter = 'all') {
    const data = platformFilter === 'all' ? campaignData : campaignData.filter(c => c.platform === platformFilter)
    if (data.length === 0) return '—'
    switch (metric) {
      case 'total_spend': return `$${data.reduce((s, c) => s + (c.spend || 0), 0).toFixed(2)}`
      case 'total_roas': {
        const totalSpend = data.reduce((s, c) => s + (c.spend || 0), 0)
        const avgRoas = totalSpend > 0 ? data.reduce((s, c) => s + (c.roas || 0), 0) / data.length : 0
        return `${avgRoas.toFixed(2)}x`
      }
      case 'total_conversions': return data.reduce((s, c) => s + (c.conversions || 0), 0).toFixed(0)
      case 'impressions': return data.reduce((s, c) => s + (c.impressions || 0), 0).toLocaleString()
      case 'clicks': return data.reduce((s, c) => s + (c.clicks || 0), 0).toLocaleString()
      case 'ctr': return `${(data.reduce((s, c) => s + (c.ctr || 0), 0) / data.length).toFixed(2)}%`
      case 'cpc': return `$${(data.reduce((s, c) => s + (c.cpc || 0), 0) / data.length).toFixed(2)}`
      case 'cpm': return `$${(data.reduce((s, c) => s + (c.cpm || 0), 0) / data.length).toFixed(2)}`
      case 'cpl': {
        const totalConv = data.reduce((s, c) => s + (c.conversions || 0), 0)
        const totalSpend = data.reduce((s, c) => s + (c.spend || 0), 0)
        return totalConv > 0 ? `$${(totalSpend / totalConv).toFixed(2)}` : '—'
      }
      default: return '—'
    }
  }

  function getTopCampaigns() {
    return [...campaignData]
      .sort((a, b) => (b.spend || 0) - (a.spend || 0))
      .slice(0, 8)
  }

  function getSpendByPlatform() {
    const platforms = ['meta', 'google', 'tiktok']
    return platforms.map(p => ({
      platform: p,
      spend: campaignData.filter(c => c.platform === p).reduce((s, c) => s + (c.spend || 0), 0)
    })).filter(p => p.spend > 0)
  }

  const platformColors: Record<string, string> = {
    meta: 'bg-blue-500',
    google: 'bg-red-500',
    tiktok: 'bg-slate-900',
  }

  const platformLabels: Record<string, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    tiktok: 'TikTok Ads',
  }

  if (!isPro) {
    return (
      <div className="font-sans p-6 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📊</p>
          <h1 className="text-2xl font-medium text-slate-900 mb-3">Custom Dashboards</h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Connect your ad platforms and build custom reporting dashboards with templates for agencies, ecommerce and lead gen.</p>
          <button onClick={() => setShowUpgrade(true)} className="bg-blue-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Upgrade to Pro to Unlock
          </button>
        </div>
        {showUpgrade && (
          <UpgradeModal
            isOpen={true}
            onClose={() => setShowUpgrade(false)}
            feature="Custom Dashboards"
            requiredPlan="pro"
          />
        )}
      </div>
    )
  }

  return (
    <div className="font-sans p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 mb-1">Custom Dashboards</h1>
          <p className="text-slate-500 text-sm">Build and customise your ad performance dashboards.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          + New Dashboard
        </button>
      </div>

      {/* No data state */}
      {campaignData.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-800 text-sm">No ad data connected yet</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Go to <a href="/dashboard/connectors" className="underline font-medium">Connectors</a> to connect your Meta, Google or TikTok ad accounts first.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-6">

        {/* Sidebar — dashboard list */}
        <div className="w-56 flex-shrink-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Your Dashboards</p>
          <div className="space-y-1">
            {dashboards.map(dash => (
              <button
                key={dash.id}
                onClick={() => { setActiveDashboard(dash); fetchWidgets(dash.id) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeDashboard?.id === dash.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {TEMPLATES.find(t => t.id === dash.template_type)?.icon || '📊'} {dash.name}
              </button>
            ))}
            {dashboards.length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-2">No dashboards yet</p>
            )}
          </div>
        </div>

        {/* Main dashboard area */}
        <div className="flex-1 min-w-0">
          {activeDashboard ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-medium text-slate-900 text-lg">{activeDashboard.name}</h2>
                <button
                  onClick={() => setShowWidgetPicker(true)}
                  className="text-sm border border-slate-200 text-slate-600 font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  + Add Widget
                </button>
              </div>

              {widgets.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
                  <p className="text-3xl mb-3">📊</p>
                  <p className="font-medium text-slate-600 mb-2">No widgets yet</p>
                  <p className="text-slate-400 text-sm mb-4">Add widgets to start building your dashboard</p>
                  <button onClick={() => setShowWidgetPicker(true)} className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                    Add First Widget
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {widgets.map(widget => {
                    if (widget.widget_type === 'metric') {
                      const value = getMetricValue(widget.metric)
                      const widgetDef = WIDGET_TYPES.find(w => w.id === widget.metric)
                      return (
                        <div key={widget.id} className={`bg-white border border-slate-200 rounded-2xl p-5 relative group ${widget.width === 'full' ? 'sm:col-span-2 xl:col-span-4' : widget.width === 'half' ? 'xl:col-span-2' : ''}`}>
                          <button onClick={() => removeWidget(widget.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-100 text-red-500 rounded-full text-xs font-medium transition-opacity hover:bg-red-200">✕</button>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">{widgetDef?.icon} {widget.title}</p>
                          <p className="text-3xl font-medium text-slate-900">{value}</p>
                          <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
                        </div>
                      )
                    }

                    if (widget.widget_type === 'table') {
                      const campaigns = getTopCampaigns()
                      return (
                        <div key={widget.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:col-span-2 xl:col-span-4 relative group">
                          <button onClick={() => removeWidget(widget.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-100 text-red-500 rounded-full text-xs font-medium transition-opacity hover:bg-red-200">✕</button>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">🏆 {widget.title}</p>
                          {campaigns.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-8">No campaign data. Sync your ad accounts first.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-100">
                                    <th className="text-left font-medium text-slate-500 pb-2 text-xs">Campaign</th>
                                    <th className="text-left font-medium text-slate-500 pb-2 text-xs">Platform</th>
                                    <th className="text-right font-medium text-slate-500 pb-2 text-xs">Spend</th>
                                    <th className="text-right font-medium text-slate-500 pb-2 text-xs">Clicks</th>
                                    <th className="text-right font-medium text-slate-500 pb-2 text-xs">CTR</th>
                                    <th className="text-right font-medium text-slate-500 pb-2 text-xs">Conv.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {campaigns.map((c, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                      <td className="py-2.5 pr-4 font-medium text-slate-800 max-w-[200px] truncate">{c.campaign_name}</td>
                                      <td className="py-2.5 pr-4">
                                        <span className={`text-xs font-medium text-white px-2 py-0.5 rounded-full ${platformColors[c.platform] || 'bg-slate-500'}`}>
                                          {platformLabels[c.platform] || c.platform}
                                        </span>
                                      </td>
                                      <td className="py-2.5 text-right font-medium text-slate-900">${(c.spend || 0).toFixed(2)}</td>
                                      <td className="py-2.5 text-right text-slate-600">{(c.clicks || 0).toLocaleString()}</td>
                                      <td className="py-2.5 text-right text-slate-600">{(c.ctr || 0).toFixed(2)}%</td>
                                      <td className="py-2.5 text-right text-slate-600">{(c.conversions || 0).toFixed(0)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    }

                    if (widget.widget_type === 'chart') {
                      const spendData = getSpendByPlatform()
                      const totalSpend = spendData.reduce((s, p) => s + p.spend, 0)
                      return (
                        <div key={widget.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:col-span-2 xl:col-span-2 relative group">
                          <button onClick={() => removeWidget(widget.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-100 text-red-500 rounded-full text-xs font-medium transition-opacity hover:bg-red-200">✕</button>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">🥧 {widget.title}</p>
                          {spendData.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
                          ) : (
                            <div className="space-y-3">
                              {spendData.map(p => (
                                <div key={p.platform}>
                                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                                    <span className="font-medium">{platformLabels[p.platform]}</span>
                                    <span className="font-medium">${p.spend.toFixed(2)} ({totalSpend > 0 ? ((p.spend / totalSpend) * 100).toFixed(0) : 0}%)</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${platformColors[p.platform]}`}
                                      style={{ width: totalSpend > 0 ? `${(p.spend / totalSpend) * 100}%` : '0%' }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }

                    return null
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
              <p className="font-medium text-slate-600 mb-4">Create your first dashboard</p>
              <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                Create Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create dashboard modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-medium text-slate-900">Create New Dashboard</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-medium text-sm">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-2">Dashboard Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q1 Performance, Client ABC Report"
                  value={newDashName}
                  onChange={e => setNewDashName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-3">Choose Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : `${template.color} hover:border-slate-300`
                      }`}
                    >
                      <span className="text-2xl block mb-2">{template.icon}</span>
                      <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                      {template.widgets.length > 0 && (
                        <p className="text-xs text-blue-600 font-medium mt-2">{template.widgets.length} widgets included</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createDashboard}
                  disabled={!newDashName.trim()}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Create Dashboard
                </button>
                <button onClick={() => setShowCreate(false)} className="border border-slate-200 text-slate-600 font-medium px-6 py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget picker modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-medium text-slate-900">Add Widget</h2>
              <button onClick={() => setShowWidgetPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-medium text-sm">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {WIDGET_TYPES.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget)}
                  className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <span className="text-xl block mb-1">{widget.icon}</span>
                  <p className="font-medium text-slate-800 text-xs group-hover:text-blue-700">{widget.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">{widget.type}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUpgrade && (
        <UpgradeModal
          isOpen={true}
          onClose={() => setShowUpgrade(false)}
          feature="Custom Dashboards"
          requiredPlan="pro"
        />
      )}
    </div>
  )
}
