import { createHash } from 'crypto'

export interface EventData {
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  external_id?: string
  fbp?: string
  fbc?: string
  client_ip_address?: string
  client_user_agent?: string
  [key: string]: any
}

export interface EMQFixResult {
  score: number
  fixed_fields: Record<string, string>
  suggested_fields: Record<string, string>
  original_event: EventData
  fixed_event: EventData
  timestamp: string
}

/**
 * EMQ Auto-Fix Engine
 * Automatically fixes and scores event data quality
 */
export class EMQAutoFixEngine {
  /**
   * Main fix function that processes an event
   */
  static fix(event: EventData, requestHeaders?: Headers): EMQFixResult {
    const original_event = { ...event }
    const fixed_event = { ...event }
    const fixed_fields: Record<string, string> = {}
    const suggested_fields: Record<string, string> = {}

    // 1. Normalize email (lowercase, trim, SHA256 hash)
    if (event.email) {
      const normalizedEmail = event.email.toLowerCase().trim()
      const hashedEmail = createHash('sha256').update(normalizedEmail).digest('hex')
      fixed_event.email = hashedEmail
      fixed_fields.email = 'Normalized and hashed'
    } else {
      suggested_fields.email = 'Email is missing - add email for better match rates'
    }

    // 2. Normalize phone to E.164 then SHA256 hash
    if (event.phone) {
      const normalizedPhone = this.normalizePhoneToE164(event.phone)
      if (normalizedPhone) {
        const hashedPhone = createHash('sha256').update(normalizedPhone).digest('hex')
        fixed_event.phone = hashedPhone
        fixed_fields.phone = 'Normalized to E.164 and hashed'
      } else {
        suggested_fields.phone = 'Phone format invalid - should be in E.164 format (+1234567890)'
      }
    } else {
      suggested_fields.phone = 'Phone is missing - add phone for improved match rates'
    }

    // 3. Auto-generate + persist external_id if missing
    if (!event.external_id) {
      const externalId = this.generateExternalId(event)
      fixed_event.external_id = externalId
      fixed_fields.external_id = 'Auto-generated unique identifier'
    }

    // 4. Extract fbp/fbc from cookies/URL params if missing
    if (!event.fbp && requestHeaders) {
      const fbp = this.extractFBP(requestHeaders)
      if (fbp) {
        fixed_event.fbp = fbp
        fixed_fields.fbp = 'Extracted from request cookies'
      } else {
        suggested_fields.fbp = 'fbp missing - ensure _fbp cookie is captured'
      }
    }

    if (!event.fbc && requestHeaders) {
      const fbc = this.extractFBC(requestHeaders)
      if (fbc) {
        fixed_event.fbc = fbc
        fixed_fields.fbc = 'Extracted from request cookies/URL'
      } else {
        suggested_fields.fbc = 'fbc missing - ensure fbclid parameter is captured from Meta ads'
      }
    }

    // 5. Extract IP from request headers if missing
    if (!event.client_ip_address && requestHeaders) {
      const ip = this.extractIP(requestHeaders)
      if (ip) {
        fixed_event.client_ip_address = ip
        fixed_fields.client_ip_address = 'Extracted from request headers'
      } else {
        suggested_fields.client_ip_address = 'IP address missing - ensure X-Forwarded-For or similar header is captured'
      }
    }

    // 6. Extract user_agent from headers if missing
    if (!event.client_user_agent && requestHeaders) {
      const ua = this.extractUserAgent(requestHeaders)
      if (ua) {
        fixed_event.client_user_agent = ua
        fixed_fields.client_user_agent = 'Extracted from request headers'
      } else {
        suggested_fields.client_user_agent = 'User agent missing - ensure User-Agent header is captured'
      }
    }

    // Calculate score (0-10 scale)
    const score = this.calculateScore(fixed_event)

    return {
      score,
      fixed_fields,
      suggested_fields,
      original_event,
      fixed_event,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Normalize phone number to E.164 format
   */
  private static normalizePhoneToE164(phone: string): string | null {
    try {
      // Remove all non-digit characters except +
      let cleaned = phone.replace(/[^\d+]/g, '')

      // Handle different formats
      if (cleaned.startsWith('+')) {
        // Already has +, validate length
        const digits = cleaned.substring(1)
        if (digits.length >= 10 && digits.length <= 15) {
          return cleaned
        }
      } else if (cleaned.length === 10) {
        // US number without country code
        return `+1${cleaned}`
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        // US number with country code but no +
        return `+${cleaned}`
      }

      return null // Invalid format
    } catch {
      return null
    }
  }

  /**
   * Generate a unique external_id based on available user data
   */
  private static generateExternalId(event: EventData): string {
    const components = [
      event.email || '',
      event.phone || '',
      event.first_name || '',
      event.last_name || '',
      event.external_id || '', // Use existing if present
    ].filter(Boolean)

    if (components.length === 0) {
      // Fallback to timestamp-based ID
      return `th_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`
    }

    const combined = components.join('|')
    return createHash('sha256').update(combined).digest('hex').substring(0, 16)
  }

  /**
   * Extract fbp from request cookies
   */
  private static extractFBP(headers: Headers): string | null {
    const cookie = headers.get('cookie') || ''
    const fbpMatch = cookie.match(/_fbp=([^;]+)/)
    return fbpMatch ? fbpMatch[1] : null
  }

  /**
   * Extract fbc from request cookies or URL parameters
   */
  private static extractFBC(headers: Headers): string | null {
    // Try cookie first
    const cookie = headers.get('cookie') || ''
    const fbcMatch = cookie.match(/_fbc=([^;]+)/)
    if (fbcMatch) return fbcMatch[1]

    // Try URL parameters (fbclid)
    const referer = headers.get('referer') || ''
    try {
      const url = new URL(referer)
      const fbclid = url.searchParams.get('fbclid')
      if (fbclid) {
        // Convert fbclid to fbc format: fb.1.{timestamp}.{fbclid}
        const timestamp = Math.floor(Date.now() / 1000)
        return `fb.1.${timestamp}.${fbclid}`
      }
    } catch {
      // Invalid URL, ignore
    }

    return null
  }

  /**
   * Extract IP address from request headers
   */
  private static extractIP(headers: Headers): string | null {
    return (
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      headers.get('cf-connecting-ip') ||
      headers.get('x-client-ip') ||
      null
    )
  }

  /**
   * Extract user agent from request headers
   */
  private static extractUserAgent(headers: Headers): string | null {
    return headers.get('user-agent')
  }

  /**
   * Calculate EMQ score (0-10 scale)
   */
  private static calculateScore(event: EventData): number {
    let score = 0

    // Email: 2 points
    if (event.email) score += 2

    // Phone: 1 point
    if (event.phone) score += 1

    // Name (first + last): 1 point
    if (event.first_name && event.last_name) score += 1

    // Location (any of city/state/zip/country): 1 point
    if (event.city || event.state || event.zip || event.country) score += 1

    // fbp: 2 points
    if (event.fbp) score += 2

    // fbc: 2 points
    if (event.fbc) score += 2

    // External ID: 1 point
    if (event.external_id) score += 1

    // IP Address: 1 point
    if (event.client_ip_address) score += 1

    // User Agent: 1 point
    if (event.client_user_agent) score += 1

    // Cap at 10
    return Math.min(10, score)
  }
}