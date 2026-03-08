'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<
    'loading' | 'valid' | 'invalid' | 'success'
  >('loading')
  const [invite, setInvite] = useState<{
    member_email?: string
    role?: string
  } | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }
    fetch(`/api/team/verify-invite?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setInvite(data.invite)
          setIsNewUser(data.isNewUser)
          setStatus('valid')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const acceptInvite = async () => {
    setProcessing(true)
    setError('')

    const res = await fetch('/api/team/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, name, isNewUser }),
    })

    const data = await res.json()

    if (data.success) {
      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      setError(data.error || 'Something went wrong')
      setProcessing(false)
    }
  }

  if (status === 'loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            aria-hidden
          />
          <p className="text-slate-500">Verifying invitation...</p>
        </div>
      </div>
    )

  if (status === 'invalid')
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4" aria-hidden>
            ❌
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-slate-500 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            Go to TrackHive →
          </a>
        </div>
      </div>
    )

  if (status === 'success')
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4" aria-hidden>
            🎉
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to the team!
          </h1>
          <p className="text-slate-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Join TrackHive
          </h1>
          <p className="text-slate-500 text-sm">
            You&apos;ve been invited as a{' '}
            <strong className="text-blue-600">{invite?.role ?? 'member'}</strong>
          </p>
        </div>

        {isNewUser ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 bg-blue-50 rounded-lg p-3">
              Create your free account to accept this invitation.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={invite?.member_email ?? ''}
                disabled
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Create Password
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700">
              ✅ You already have a TrackHive account. Click below to accept the
              invitation.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={acceptInvite}
          disabled={
            processing || (isNewUser && (!password || !name))
          }
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold mt-6 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {processing
            ? 'Processing...'
            : isNewUser
              ? 'Create Account & Join'
              : 'Accept Invitation'}
        </button>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              aria-hidden
            />
            <p className="text-slate-500">Verifying invitation...</p>
          </div>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  )
}
