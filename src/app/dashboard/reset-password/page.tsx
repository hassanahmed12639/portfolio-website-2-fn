'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCheckingLink, setIsCheckingLink] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function validateRecoverySession() {
      const supabase = createClient()

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          if (mounted) setIsCheckingLink(false)
          return
        }

        const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && refreshToken && type === 'recovery') {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (setSessionError) {
            throw setSessionError
          }
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname)
          }
          if (mounted) setIsCheckingLink(false)
          return
        }

        if (mounted) {
          setError('This reset link is invalid or expired. Please request a new one.')
          setIsCheckingLink(false)
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : String(err)
          setError(message || 'Could not validate reset link. Please request a new one.')
          setIsCheckingLink(false)
        }
      }
    }

    void validateRecoverySession()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Password updated successfully. Redirecting to login...')
      setTimeout(() => {
        router.replace('/dashboard/login')
      }, 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Could not update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-shell min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--dash-bg)]">
      <Card className="w-full max-w-md border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-[var(--dash-text)]">Set a new password</CardTitle>
          <CardDescription className="text-[var(--dash-muted)]">
            Choose a strong new password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {isCheckingLink ? (
            <p className="text-sm text-[var(--dash-muted)]">Validating reset link…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[var(--dash-text)]">
                  New password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-10 pr-10 bg-[var(--dash-surface)] border-[var(--dash-border)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-[var(--dash-text)]">
                  Confirm password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="pl-10 pr-10 bg-[var(--dash-surface)] border-[var(--dash-border)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-[var(--dash-danger)] bg-[var(--dash-danger-soft)] border border-[var(--dash-danger-border)] rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-primary-strong)] disabled:opacity-50"
              >
                {loading ? 'Updating password…' : 'Update password'}
              </Button>
            </form>
          )}

          <Link
            href="/dashboard/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--dash-muted)] hover:text-[var(--dash-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
