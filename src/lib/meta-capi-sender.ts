import axios, { AxiosError, AxiosInstance } from 'axios'
import https from 'https'

export type MetaCapiPayload = {
  data: Array<Record<string, unknown>>
  test_event_code?: string
}

export type MetaCapiRawResponse = Record<string, unknown>

export type MetaCapiNormalizedResponse = {
  success: boolean
  eventsReceived: number
  fbtraceId: string | null
  statusCode: number
}

export type MetaCapiResult = {
  raw: MetaCapiRawResponse
  normalized: MetaCapiNormalizedResponse
}

export type MetaCapiErrorKind = 'network' | 'api' | 'validation' | 'unknown'

export class MetaCapiError extends Error {
  public kind: MetaCapiErrorKind
  public statusCode?: number
  public rawResponse?: unknown
  public code?: string

  constructor(
    kind: MetaCapiErrorKind,
    message: string,
    statusCode?: number,
    rawResponse?: unknown,
    code?: string
  ) {
    super(message)
    this.name = 'MetaCapiError'
    this.kind = kind
    this.statusCode = statusCode
    this.rawResponse = rawResponse
    this.code = code
  }
}

const keepAliveAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  maxSockets: 100,
  rejectUnauthorized: true,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
})

const client: AxiosInstance = axios.create({
  baseURL: 'https://graph.facebook.com',
  timeout: 10000,
  httpsAgent: keepAliveAgent,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  validateStatus: () => true,
})

const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'EADDRINFO',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EPIPE',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ECONNABORTED',
])

const MAX_RETRY_ATTEMPTS = 3
const BASE_BACKOFF_MS = 500
const MAX_BACKOFF_MS = 10000

function logStructured(level: 'info' | 'warn' | 'error', event: string, details: Record<string, unknown>) {
  const record = {
    timestamp: new Date().toISOString(),
    service: 'meta-capi',
    event,
    level,
    ...details,
  }

  if (level === 'error') {
    console.error(JSON.stringify(record))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(record))
  } else {
    console.log(JSON.stringify(record))
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeMetaResponse(data: unknown, statusCode: number): MetaCapiNormalizedResponse {
  const raw = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
  const eventsReceived = Number(raw.events_received ?? 0)

  return {
    success: raw.error === undefined,
    eventsReceived: eventsReceived >= 0 ? eventsReceived : 0,
    fbtraceId: typeof raw.fbtrace_id === 'string' ? raw.fbtrace_id : null,
    statusCode,
  }
}

function classifyAxiosError(error: AxiosError): MetaCapiError {
  const message = error.message || 'Meta CAPI network failure'
  const code = error.code

  if (!error.response) {
    const kind: MetaCapiErrorKind = RETRYABLE_NETWORK_CODES.has(code ?? '') ? 'network' : 'network'
    return new MetaCapiError(kind, message, undefined, undefined, code)
  }

  const status = error.response.status
  const raw = error.response.data

  if (status >= 500 || status === 429) {
    return new MetaCapiError('api', message, status, raw, code)
  }

  if (status >= 400) {
    return new MetaCapiError('validation', message, status, raw, code)
  }

  return new MetaCapiError('unknown', message, status, raw, code)
}

function createErrorFromResponse(raw: unknown, statusCode: number, url: string): MetaCapiError {
  const body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const errorPayload = body.error ?? raw
  const message =
    typeof errorPayload === 'object' && errorPayload !== null
      ? (errorPayload as Record<string, unknown>).message || JSON.stringify(errorPayload)
      : String(errorPayload)

  const kind: MetaCapiErrorKind =
    statusCode >= 500 || statusCode === 429 ? 'api' : statusCode >= 400 ? 'validation' : 'unknown'

  return new MetaCapiError(kind, `Meta CAPI error from ${url}: ${message}`, statusCode, raw)
}

function shouldRetry(error: MetaCapiError, attempt: number): boolean {
  if (attempt >= MAX_RETRY_ATTEMPTS) {
    return false
  }

  if (error.kind === 'network') {
    return true
  }

  if (error.kind === 'api' && (error.statusCode === 429 || error.statusCode === 503 || error.statusCode === 502 || error.statusCode === 504)) {
    return true
  }

  return false
}

function getBackoffDelay(attempt: number): number {
  const base = BASE_BACKOFF_MS * 2 ** (attempt - 1)
  const jitter = Math.floor(Math.random() * 200)
  return Math.min(base + jitter, MAX_BACKOFF_MS)
}

export async function sendMetaCapiEvent(options: {
  pixelId: string
  accessToken: string
  eventPayload: MetaCapiPayload
}): Promise<MetaCapiResult> {
  const { pixelId, accessToken, eventPayload } = options
  const url = `/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(
    accessToken
  )}`

  logStructured('info', 'meta_capi_send_attempt', {
    pixelId,
    payloadSize: JSON.stringify(eventPayload).length,
    maxAttempts: MAX_RETRY_ATTEMPTS,
  })

  let lastError: MetaCapiError | null = null

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    const attemptStart = Date.now()

    try {
      const response = await client.post(url, eventPayload)
      const elapsedMs = Date.now() - attemptStart
      const rawResponse = response.data
      const statusCode = response.status

      if (statusCode >= 400 || (typeof rawResponse === 'object' && rawResponse !== null && 'error' in rawResponse)) {
        const error = createErrorFromResponse(rawResponse, statusCode, url)
        logStructured('warn', 'meta_capi_api_error', {
          pixelId,
          url,
          attempt,
          elapsedMs,
          statusCode,
          kind: error.kind,
          error: error.message,
        })

        if (shouldRetry(error, attempt)) {
          lastError = error
          const backoff = getBackoffDelay(attempt)
          await delay(backoff)
          continue
        }

        throw error
      }

      const normalized = normalizeMetaResponse(rawResponse, statusCode)
      logStructured('info', 'meta_capi_send_success', {
        pixelId,
        url,
        attempt,
        elapsedMs,
        statusCode,
        normalized,
      })

      return {
        raw: typeof rawResponse === 'object' && rawResponse !== null ? rawResponse : { data: rawResponse },
        normalized,
      }
    } catch (error: unknown) {
      const axiosError = error instanceof Error && (error as AxiosError).isAxiosError ? (error as AxiosError) : null
      const metaError = axiosError ? classifyAxiosError(axiosError) : new MetaCapiError('unknown', error instanceof Error ? error.message : String(error))
      logStructured('error', 'meta_capi_network_error', {
        pixelId,
        url,
        attempt,
        kind: metaError.kind,
        message: metaError.message,
        code: metaError.code,
        statusCode: metaError.statusCode,
      })

      if (shouldRetry(metaError, attempt)) {
        lastError = metaError
        const backoff = getBackoffDelay(attempt)
        await delay(backoff)
        continue
      }

      throw metaError
    }
  }

  throw lastError ?? new MetaCapiError('unknown', 'Meta CAPI request failed after retries')
}
