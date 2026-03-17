'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard/reset-password`
          : undefined

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(
        'Password reset link sent. Check your inbox (and spam folder), then open the link to set a new password.'
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Unable to send reset link right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-shell min-h-screen flex items-center justify-center px-4 py-10 bg-[var(--dash-bg)]">
      <Card className="w-full max-w-md border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-[var(--dash-text)]">Reset your password</CardTitle>
          <CardDescription className="text-[var(--dash-muted)]">
            Enter your account email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[var(--dash-text)]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-[var(--dash-surface)] border-[var(--dash-border)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                  required
                />
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
              {loading ? 'Sending link…' : 'Send reset link'}
            </Button>
          </form>

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
