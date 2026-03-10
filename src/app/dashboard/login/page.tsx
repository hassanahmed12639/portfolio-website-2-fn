'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LoginRadar from './LoginRadar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Chrome } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()

    type P = { x: number; y: number; v: number; o: number }
    let ps: P[] = []
    let raf = 0

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    })

    const init = () => {
      ps = []
      const count = Math.floor((canvas.width * canvas.height) / 9000)
      for (let i = 0; i < count; i++) ps.push(make())
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ps.forEach((p) => {
        p.y -= p.v
        if (p.y < 0) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + Math.random() * 40
          p.v = Math.random() * 0.25 + 0.05
          p.o = Math.random() * 0.35 + 0.15
        }
        ctx.fillStyle = `rgba(15,23,42,${p.o})`
        ctx.fillRect(p.x, p.y, 0.7, 2.2)
      })
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      setSize()
      init()
    }

    window.addEventListener('resize', onResize)
    init()
    raf = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message === 'Failed to fetch' || message.includes('fetch')) {
        setError(
          'Cannot reach the authentication server. Check your internet connection and Supabase configuration in .env.local.'
        )
      } else {
        setError(message)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (!data.session) {
        setError('Login failed. Please try again.')
        return
      }

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, dashboard_type')
        .eq('id', data.user.id)
        .single()

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!profile?.onboarding_completed) {
        window.location.href = '/onboarding'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('[Login] Error:', err)
      const message = err instanceof Error ? err.message : String(err)
      if (
        message.includes('Supabase') ||
        message.includes('URL') ||
        message.includes('API key')
      ) {
        setError(
          'Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the dev server.'
        )
      } else {
        setError(message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await handleLogin()
  }

  return (
    <div className="dashboard-shell min-h-screen flex flex-col md:flex-row bg-[var(--dash-bg)] relative overflow-hidden">
      <style>{`
        .login-accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .login-hline,.login-vline{position:absolute;background:var(--dash-border);will-change:transform,opacity}
        .login-hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:loginDrawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .login-vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:loginDrawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .login-hline:nth-child(1){top:18%;animation-delay:.12s}
        .login-hline:nth-child(2){top:50%;animation-delay:.22s}
        .login-hline:nth-child(3){top:82%;animation-delay:.32s}
        .login-vline:nth-child(4){left:22%;animation-delay:.42s}
        .login-vline:nth-child(5){left:50%;animation-delay:.54s}
        .login-vline:nth-child(6){left:78%;animation-delay:.66s}
        @keyframes loginDrawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes loginDrawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        .login-card-animate{opacity:0;transform:translateY(20px);animation:loginFadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards}
        @keyframes loginFadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(29,78,216,0.06),transparent_60%)]" />
      <div className="login-accent-lines">
        <div className="login-hline" />
        <div className="login-hline" />
        <div className="login-hline" />
        <div className="login-vline" />
        <div className="login-vline" />
        <div className="login-vline" />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply pointer-events-none"
      />

      <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-[var(--dash-border)]">
        <span className="text-xs tracking-[0.14em] uppercase text-[var(--dash-muted)]">
          TrackHive
        </span>
        <Link href="/contact">
          <Button
            variant="outline"
            className="h-9 rounded-lg border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]"
          >
            <span className="mr-2">Contact</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 relative z-10">
        <Card className="login-card-animate w-full max-w-sm border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-[var(--dash-text)]">
              Welcome back
            </CardTitle>
            <CardDescription className="text-[var(--dash-muted)]">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            <form onSubmit={handleSubmit} className="grid gap-5">
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
                    required
                    autoComplete="email"
                    className="pl-10 bg-[var(--dash-surface)] border-[var(--dash-border)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[var(--dash-text)]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dash-muted)]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pl-10 pr-10 bg-[var(--dash-surface)] border-[var(--dash-border)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    className="border-[var(--dash-border)] rounded checked:bg-[var(--dash-primary)] checked:border-[var(--dash-primary)]"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-[var(--dash-muted)] text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm text-[var(--dash-muted)] hover:text-[var(--dash-primary)]"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <p className="text-sm text-[var(--dash-danger)] bg-[var(--dash-danger-soft)] border border-[var(--dash-danger-border)] rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Continue'}
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-[var(--dash-border)]" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[var(--dash-card)] px-2 text-[11px] uppercase tracking-widest text-[var(--dash-muted)]">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-10 rounded-lg border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] disabled:opacity-50"
            >
              <Chrome className="h-4 w-4 mr-2" />
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center text-sm text-[var(--dash-muted)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/dashboard/signup"
              className="ml-1 text-[var(--dash-primary)] hover:underline font-medium"
            >
              Create one
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="hidden md:flex flex-1 relative min-w-0 md:min-w-[420px] min-h-[320px] md:min-h-screen bg-gradient-to-b from-[var(--dash-primary-soft)] to-[var(--dash-primary-soft-strong)] items-center justify-center overflow-hidden rounded-l-2xl">
        <LoginRadar />
      </div>
    </div>
  )
}
