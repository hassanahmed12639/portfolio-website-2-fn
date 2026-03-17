const rateLimitMap = new Map<string, { count: number; resetTime: number; maxRequests: number }>()
const rateLimitStatsMap = new Map<
  string,
  { hits: number; blocked: number; lastSeen: number }
>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfterSeconds: number
}

export interface RateLimitStatsSnapshot {
  generatedAt: string
  totalScopes: number
  totals: {
    hits: number
    blocked: number
    blockedRatio: number
  }
  scopes: Array<{
    scope: string
    hits: number
    blocked: number
    blockedRatio: number
    lastSeen: string
  }>
}

function toScopeKey(identifier: string): string {
  const ipMarker = '|ip='
  if (identifier.includes(ipMarker)) {
    return identifier.split(ipMarker)[0]
  }
  const idx = identifier.lastIndexOf(':')
  if (idx > 0) return identifier.slice(0, idx)
  return identifier
}

function upsertStats(identifier: string, blocked: boolean) {
  const now = Date.now()
  const scope = toScopeKey(identifier)
  const existing = rateLimitStatsMap.get(scope)
  if (!existing) {
    rateLimitStatsMap.set(scope, {
      hits: 1,
      blocked: blocked ? 1 : 0,
      lastSeen: now,
    })
  } else {
    existing.hits++
    if (blocked) existing.blocked++
    existing.lastSeen = now
  }

  // Keep stats map bounded in memory.
  if (rateLimitStatsMap.size > 2000) {
    const cutoff = now - 24 * 60 * 60 * 1000
    for (const [key, value] of rateLimitStatsMap.entries()) {
      if (value.lastSeen < cutoff) rateLimitStatsMap.delete(key)
    }
  }
}

export function getRateLimitStatsSnapshot(topN = 20): RateLimitStatsSnapshot {
  const totals = { hits: 0, blocked: 0 }
  const scopes = Array.from(rateLimitStatsMap.entries()).map(([scope, stats]) => {
    totals.hits += stats.hits
    totals.blocked += stats.blocked
    return {
      scope,
      hits: stats.hits,
      blocked: stats.blocked,
      blockedRatio: stats.hits > 0 ? stats.blocked / stats.hits : 0,
      lastSeen: new Date(stats.lastSeen).toISOString(),
    }
  })

  scopes.sort((a, b) => {
    if (b.blocked !== a.blocked) return b.blocked - a.blocked
    return b.hits - a.hits
  })

  return {
    generatedAt: new Date().toISOString(),
    totalScopes: scopes.length,
    totals: {
      hits: totals.hits,
      blocked: totals.blocked,
      blockedRatio: totals.hits > 0 ? totals.blocked / totals.hits : 0,
    },
    scopes: scopes.slice(0, Math.max(1, topN)),
  }
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) rateLimitMap.delete(key)
    }
  }

  if (!record || record.resetTime < now) {
    const resetTime = now + config.windowMs
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime,
      maxRequests: config.maxRequests,
    })
    upsertStats(identifier, false)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
    }
  }

  if (record.count >= config.maxRequests) {
    const retryAfterMs = Math.max(0, record.resetTime - now)
    upsertStats(identifier, true)
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  record.count++
  const retryAfterMs = Math.max(0, record.resetTime - now)
  upsertStats(identifier, false)
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
  }
}
