'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/profile')
      .then((r) => r.json())
      .then((d) => {
        setProfile(d)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/dashboard/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword || newPassword.length < 8) return
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setNewPassword('')
      setConfirmPassword('')
      alert('Password updated successfully!')
    } else {
      alert('Error: ' + error.message)
    }
  }

  const handleDeleteAccount = async () => {
    // TODO: Wire to delete account API when available
    const res = await fetch('/api/dashboard/profile/delete', { method: 'DELETE' })
    if (res.ok) {
      setShowDeleteConfirm(false)
      window.location.href = '/'
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data?.error || 'Could not delete account. Please contact support.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your profile and account preferences
        </p>
      </div>

      {/* SECTION 1 — Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Personal Information</h2>
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() ||
                profile?.email?.[0]?.toUpperCase() ||
                'U'}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {profile?.full_name || 'No name set'}
              </p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
              <span
                className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  profile?.plan === 'agency'
                    ? 'bg-purple-100 text-purple-700'
                    : profile?.plan === 'pro'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {profile?.plan
                  ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
                  : 'Free'}{' '}
                Plan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile?.full_name || ''}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="John Doe"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Business Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={profile?.business_name || ''}
              onChange={(e) =>
                setProfile({ ...profile, business_name: e.target.value })
              }
              placeholder="Your Company Ltd"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={profile?.website_url || ''}
              onChange={(e) =>
                setProfile({ ...profile, website_url: e.target.value })
              }
              placeholder="https://yourwebsite.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Business Type
            </label>
            <select
              value={profile?.business_type || ''}
              onChange={(e) =>
                setProfile({ ...profile, business_type: e.target.value })
              }
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="agency">Agency</option>
              <option value="saas">SaaS</option>
              <option value="leadgen">Lead Generation</option>
              <option value="other">Content / Blog</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Dashboard Type
            </label>
            <select
              value={profile?.dashboard_type || ''}
              onChange={(e) =>
                setProfile({ ...profile, dashboard_type: e.target.value })
              }
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ecommerce">E-Commerce</option>
              <option value="leadgen">Lead Generation</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Account Details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Account ID</span>
            <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">
              {profile?.id ? `${profile.id.slice(0, 8)}...` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">API Key</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">
                {profile?.api_key ? `${profile.api_key.slice(0, 12)}...` : '—'}
              </span>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(profile?.api_key || '')
                }
                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Current Plan</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  profile?.plan === 'agency'
                    ? 'bg-purple-100 text-purple-700'
                    : profile?.plan === 'pro'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {profile?.plan
                  ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
                  : 'Free'}
              </span>
              <a
                href="/dashboard/billing"
                className="text-xs text-blue-500 hover:underline"
              >
                Manage
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Member Since</span>
            <span className="text-sm text-slate-700">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-500">Events This Month</span>
            <span className="text-sm font-semibold text-slate-700">
              {(profile?.events_this_month ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4 — Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Change Password</h2>
        <p className="text-sm text-slate-500 mb-4">
          Leave blank to keep current password
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {newPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500 mt-2">Passwords do not match</p>
        )}
        {newPassword && newPassword.length < 8 && (
          <p className="text-xs text-red-500 mt-2">
            Password must be at least 8 characters
          </p>
        )}
        {newPassword &&
          newPassword === confirmPassword &&
          newPassword.length >= 8 && (
            <button
              type="button"
              onClick={handleChangePassword}
              className="mt-3 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Update Password
            </button>
          )}
      </div>

      {/* SECTION 5 — Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">
          These actions are irreversible. Please be careful.
        </p>
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-700">Delete Account</p>
            <p className="text-xs text-slate-400">
              Permanently delete your account and all data
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Changes are saved to your profile</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Account?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
