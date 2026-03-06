export function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"`;]/g, '')
    .trim()
    .slice(0, 500)
}

export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return ''
  const cleaned = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(cleaned) ? cleaned : ''
}

export function sanitizeNumber(num: unknown): number {
  const parsed = parseFloat(String(num))
  if (isNaN(parsed) || parsed < 0 || parsed > 999999) return 0
  return parsed
}

export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') return ''
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return ''
    return parsed.toString().slice(0, 500)
  } catch {
    return ''
  }
}

export function validateEventPayload(body: Record<string, unknown>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  if (!body.pixel_id && !body.api_key) errors.push('pixel_id or api_key required')
  if (!body.event_name) errors.push('event_name required')
  if (body.event_name && String(body.event_name).length > 100) errors.push('event_name too long')
  if (body.value !== undefined && body.value !== null && isNaN(parseFloat(String(body.value)))) errors.push('value must be a number')
  if (body.currency && String(body.currency).length !== 3) errors.push('currency must be 3 characters')
  return { valid: errors.length === 0, errors }
}
