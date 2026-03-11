'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UpgradeModal } from '@/components/UpgradeModal'
import { usePlan } from '@/hooks/usePlan'

const PLATFORMS = [
  {
    id: 'meta',
    name: 'Meta Ads',
    icon: '📘',
    color: 'bg-blue-600',
    description: 'Facebook and Instagram ad campaigns',
    fields: [
      { key: 'account_id', label: 'Ad Account ID', placeholder: 'act_123456789', help: 'Found in Meta Business Suite → Accounts → Ad Accounts', isToken: false },
      { key: 'access_token', label: 'Access Token', placeholder: 'EAAxxxxxxx...', help: 'Meta Business Suite → Settings → System Users → Generate Token → Select ads_read permission', isToken: true },
    ],
    guide: [
      'Go to business.facebook.com',
      'Click Settings in the left sidebar',
      'Go to Users → System Users',
      'Click Add and create a System User with Employee role',
      'Click Generate New Token',
      'Select your app and enable ads_read and ads_management permissions',
      'Set token expiry to Never for long-lived access',
      'Copy the token and paste it here',
    ],
    tokenNote: 'System User tokens never expire. Regular tokens expire in 60 days.',
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  },
  {
    id: 'google',
    name: 'Google Ads',
    icon: '🔵',
    color: 'bg-red-500',
    description: 'Google Search, Display and YouTube campaigns',
    fields: [
      { key: 'account_id', label: 'Customer ID', placeholder: '123-456-7890', help: 'Found at the top right of your Google Ads account', isToken: false },
      { key: 'access_token', label: 'Developer Token', placeholder: 'dZxxxxxx...', help: 'Google Ads → Tools → API Center → Apply for access', isToken: true },
    ],
    guide: [
      'Sign in to your Google Ads account at ads.google.com',
      'Click Tools and Settings in the top right',
      'Under Setup click API Center',
      'Apply for Basic Access if you have not already',
      'Once approved copy your Developer Token',
      'Your Customer ID is shown at the top right of Google Ads (format: XXX-XXX-XXXX)',
      'Remove dashes when pasting the Customer ID here',
    ],
    tokenNote: 'Developer tokens do not expire but require Google approval first.',
    docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    icon: '🎵',
    color: 'bg-slate-900',
    description: 'TikTok for Business ad campaigns',
    fields: [
      { key: 'account_id', label: 'Advertiser ID', placeholder: '7012345678901234567', help: 'Found in TikTok Ads Manager → Account → Account Info', isToken: false },
      { key: 'access_token', label: 'Access Token', placeholder: 'xxxxxxxx...', help: 'TikTok for Business → My Apps → Create App → Get Access Token', isToken: true },
    ],
    guide: [
      'Go to business.tiktok.com and sign in',
      'Click your profile icon and go to Developer Portal',
      'Click Create App and fill in your app details',
      'Under Permissions enable Ads Management Read',
      'Go to My Apps and open your app',
      'Click Get Access Token and copy it',
      'Your Advertiser ID is in TikTok Ads Manager under Account Info',
    ],
    tokenNote: 'Access tokens last 24 hours. Use a long-lived token via refresh token for permanent access.',
    docsUrl: 'https://ads.tiktok.com/marketing_api/docs',
  },
]

export default function ConnectorsPage() {
  const { plan } = usePlan()
  const isPro = plan === 'pro' || plan === 'agency'
  const supabase = createClient()

  const [connections, setConnections] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({})
  const [syncing, setSyncing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [])

  async function fetchConnections() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('ad_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
    setConnections(data || [])
  }

  async function handleConnect(platformId: string) {
    if (!isPro) { setShowUpgrade(true); return }
    const fields = formData[platformId] || {}
    const platform = PLATFORMS.find(p => p.id === platformId)
    if (!platform) return
    const missing = platform.fields.find(f => !fields[f.key])
    if (missing) {
      setMessage({ type: 'error', text: `Please fill in ${missing.label}` })
      return
    }
    setConnecting(platformId)
    try {
      const res = await fetch('/api/dashboard/connectors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId, ...fields }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'success', text: `${platform.name} connected successfully!` })
      setFormData(prev => ({ ...prev, [platformId]: {} }))
      fetchConnections()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Connection failed' })
    } finally {
      setConnecting(null)
    }
  }

  async function handleSync(connectionId: string, _platformId: string) {
    setSyncing(connectionId)
    try {
      const res = await fetch('/api/dashboard/connectors/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'success', text: `Synced ${data.count} campaigns` })
      fetchConnections()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Sync failed' })
    } finally {
      setSyncing(null)
    }
  }

  async function handleDisconnect(connectionId: string) {
    await fetch('/api/dashboard/connectors/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId }),
    })
    fetchConnections()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Ad Connectors</h1>
        <p className="text-slate-500 text-sm">Connect your ad platforms to pull campaign data into custom dashboards.</p>
        {!isPro && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-amber-800 text-sm">Pro feature</p>
              <p className="text-amber-700 text-xs mt-0.5">Upgrade to Pro to connect ad platforms and build custom dashboards.</p>
            </div>
            <button onClick={() => setShowUpgrade(true)} className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0">
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Connected accounts */}
      {connections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-wide mb-3">Connected Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connections.map(conn => {
              const platform = PLATFORMS.find(p => p.id === conn.platform)
              return (
                <div key={conn.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform?.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{platform?.name}</p>
                      <p className="text-xs text-slate-500">{conn.account_name || conn.account_id}</p>
                      {conn.last_synced_at && (
                        <p className="text-xs text-slate-400">Synced {new Date(conn.last_synced_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <button
                      onClick={() => handleSync(conn.id, conn.platform)}
                      disabled={syncing === conn.id}
                      className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {syncing === conn.id ? 'Syncing...' : 'Sync'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(conn.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Platform cards */}
      <div className="space-y-4">
        {PLATFORMS.map(platform => {
          const isConnected = connections.some(c => c.platform === platform.id)
          const isExpanded = connecting === platform.id || formData[platform.id]
          return (
            <div key={platform.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {/* Platform header */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {platform.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900">{platform.name}</h3>
                      {isConnected && (
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Connected</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowGuide(showGuide === platform.id ? null : platform.id)}
                    className="text-xs border border-slate-200 text-slate-600 font-bold px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    📖 How to get token
                  </button>
                  {!isConnected && (
                    <button
                      onClick={() => isPro ? setConnecting(connecting === platform.id ? null : platform.id) : setShowUpgrade(true)}
                      className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      {!isPro ? '🔒 Connect' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              {/* How to get token guide */}
              {showGuide === platform.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-black text-slate-900 text-sm mb-1">How to get your {platform.name} token</p>
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 inline-block">
                        💡 {platform.tokenNote}
                      </p>
                    </div>
                    <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex-shrink-0">
                      Official Docs →
                    </a>
                  </div>
                  <ol className="space-y-2">
                    {platform.guide.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Connect form */}
              {connecting === platform.id && !isConnected && (
                <div className="border-t border-slate-100 p-5">
                  <p className="font-bold text-slate-900 text-sm mb-4">Enter your {platform.name} credentials</p>
                  <div className="space-y-4">
                    {platform.fields.map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">{field.label}</label>
                        <input
                          type={field.isToken ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={formData[platform.id]?.[field.key] || ''}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            [platform.id]: { ...prev[platform.id], [field.key]: e.target.value }
                          }))}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400 mt-1.5">💡 {field.help}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={connecting === platform.id && !formData[platform.id]}
                      className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors"
                    >
                      Connect {platform.name}
                    </button>
                    <button
                      onClick={() => setConnecting(null)}
                      className="border border-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showUpgrade && (
        <UpgradeModal
          isOpen={true}
          onClose={() => setShowUpgrade(false)}
          feature="Ad Connectors"
          requiredPlan="pro"
        />
      )}
    </div>
  )
}
