/**
 * Secure portfolio admin session handling.
 * Uses signed tokens to prevent cookie forgery.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'portfolio_admin_auth'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  const pwd = process.env.PORTFOLIO_ADMIN_PASSWORD
  const explicit = process.env.PORTFOLIO_ADMIN_SESSION_SECRET
  if (explicit && explicit.length >= 16) return explicit
  if (pwd && pwd.length >= 8) return createHmac('sha256', 'portfolio-session-v1').update(pwd).digest('hex')
  return ''
}

function sign(value: string): string {
  const secret = getSecret()
  const sig = createHmac('sha256', secret).update(value).digest('hex')
  return `${value}.${sig}`
}

function verifySigned(value: string): string | null {
  const secret = getSecret()
  if (!secret) return null
  const lastDot = value.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = value.slice(0, lastDot)
  const sig = value.slice(lastDot + 1)
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return null
    }
  } catch {
    return null
  }
  return payload
}

export function createSessionToken(): string {
  const payload = `${Date.now()}.${randomBytes(32).toString('hex')}`
  return sign(payload)
}

export function verifySessionToken(token: string): boolean {
  const payload = verifySigned(token)
  if (!payload) return false
  const parts = payload.split('.')
  const timestamp = parseInt(parts[0], 10)
  if (isNaN(timestamp)) return false
  if (Date.now() - timestamp > SESSION_DURATION_MS) return false
  return true
}

export function getCookieName(): string {
  return COOKIE_NAME
}
