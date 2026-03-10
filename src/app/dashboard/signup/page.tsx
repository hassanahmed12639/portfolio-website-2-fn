'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createProfileAfterSignup } from '../actions'
import LoginRadar from '../login/LoginRadar'
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
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Chrome } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
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

  async function handleGoogleSignUp() {
    setError(null)
    setGoogleLoading(true)
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
    setGoogleLoading(false)
    if (oauthError) {
      setError(oauthError.message)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    try {
      await createProfileAfterSignup()
    } catch {
      setLoading(false)
      setError('Account created but profile setup failed. Try signing in.')
      return
    }

    setLoading(false)
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="dashboard-shell min-h-screen flex flex-col md:flex-row bg-[var(--dash-bg)] relative overflow-hidden">
      <style>{`
        .signup-accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .signup-hline,.signup-vline{position:absolute;background:var(--dash-border);will-change:transform,opacity}
        .signup-hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:signupDrawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .signup-vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:signupDrawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .signup-hline:nth-child(1){top:18%;animation-delay:.12s}
        .signup-hline:nth-child(2){top:50%;animation-delay:.22s}
        .signup-hline:nth-child(3){top:82%;animation-delay:.32s}
        .signup-vline:nth-child(4){left:22%;animation-delay:.42s}
        .signup-vline:nth-child(5){left:50%;animation-delay:.54s}
        .signup-vline:nth-child(6){left:78%;animation-delay:.66s}
        @keyframes signupDrawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes signupDrawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        .signup-card-animate{opacity:0;transform:translateY(20px);animation:signupFadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards}
        @keyframes signupFadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(29,78,216,0.06),transparent_60%)]" />
      <div className="signup-accent-lines">
        <div className="signup-hline" />
        <div className="signup-hline" />
        <div className="signup-hline" />
        <div className="signup-vline" />
        <div className="signup-vline" />
        <div className="signup-vline" />
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
        <Card className="signup-card-animate w-full max-w-sm border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-[var(--dash-text)]">
              Create your account
            </CardTitle>
            <CardDescription className="text-[var(--dash-muted)]">
              Sign up to get started with TrackHive
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
                    autoComplete="new-password"
                    minLength={6}
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
                {loading ? 'Creating account…' : 'Create Account'}
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
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full h-10 rounded-lg border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] disabled:opacity-50"
            >
              <Chrome className="h-4 w-4 mr-2" />
              {googleLoading ? 'Signing up…' : 'Continue with Google'}
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center text-sm text-[var(--dash-muted)]">
            Already have an account?{' '}
            <Link
              href="/dashboard/login"
              className="ml-1 text-[var(--dash-primary)] hover:underline font-medium"
            >
              Sign in
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
