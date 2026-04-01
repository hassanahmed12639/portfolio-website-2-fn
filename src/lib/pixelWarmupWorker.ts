import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

export type PixelWarmupCredentials = {
  ga4?: {
    measurementId: string
    apiSecret: string
  }
  meta?: {
    pixelId: string
    accessToken?: string
  }
}

type PixelWarmupRecord = Record<string, string>

type PixelWarmupTask = {
  jobId: string
  rowIndex: number
  eventType: string
  record: PixelWarmupRecord
  credentials: PixelWarmupCredentials
  attempts: number
  nextRun: number
}

type PixelWarmupJob = {
  jobId: string
  eventType: string
  rows: number
  queued: number
  sent: number
  failed: number
  skipped: number
  status: 'running' | 'completed'
  createdAt: string
  updatedAt: string
  errors: Array<{ rowIndex: number; message: string }>
}

const MAX_RETRIES = 3
const QUEUE_POLL_MS = 3000
const tasks: PixelWarmupTask[] = []
const jobs = new Map<string, PixelWarmupJob>()
let workerStarted = false
const STORE_FILE_PATH = path.join(process.cwd(), 'pixel-warmup-store.json')

async function persistStore() {
  try {
    const store = {
      jobs: Array.from(jobs.values()),
      tasks,
    }
    await fs.writeFile(STORE_FILE_PATH, JSON.stringify(store, null, 2), 'utf8')
  } catch (error) {
    console.error('[pixel-warmup] persistStore error', error)
  }
}

async function loadStore() {
  try {
    const content = await fs.readFile(STORE_FILE_PATH, 'utf8')
    const parsed = JSON.parse(content) as {
      jobs: PixelWarmupJob[]
      tasks: PixelWarmupTask[]
    }

    parsed.jobs?.forEach((job) => jobs.set(job.jobId, job))
    if (Array.isArray(parsed.tasks)) {
      tasks.splice(0, tasks.length, ...parsed.tasks.map((task) => ({
        ...task,
        nextRun: task.nextRun || Date.now(),
      })))
    }

    if (tasks.length > 0) {
      startQueueWorker()
    }
  } catch {
    // ignore missing or invalid store file
  }
}

const warmupStoreReady = loadStore()

export async function waitForWarmupStore() {
  await warmupStoreReady
}

function safeEventName(eventType: string) {
  return String(eventType || 'event')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

function sanitizeEmail(value: string) {
  return String(value || '').trim().toLowerCase()
}

function sanitizePhone(value: string) {
  return String(value || '').trim().replace(/[^0-9+]/g, '')
}

function hashValue(value: string) {
  return crypto.createHash('sha256').update(String(value || '').trim().toLowerCase()).digest('hex')
}

function getRandomDelayMs() {
  return 60000 + Math.floor(Math.random() * 60000)
}

function nowIso() {
  return new Date().toISOString()
}

async function sendGa4Event(credentials: NonNullable<PixelWarmupCredentials['ga4']>, eventType: string, record: PixelWarmupRecord) {
  const email = sanitizeEmail(record.email)
  const phone = sanitizePhone(record.phone)
  const clientId = hashValue(email || phone || String(Date.now()))

  const params: Record<string, unknown> = {
    first_name: record.first_name || '',
    last_name: record.last_name || '',
  }

  const payload = {
    client_id: clientId,
    events: [
      {
        name: safeEventName(eventType),
        params,
      },
    ],
  }

  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    credentials.measurementId
  )}&api_secret=${encodeURIComponent(credentials.apiSecret)}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const bodyText = await res.text()
    throw new Error(`GA4 error ${res.status}: ${bodyText}`)
  }
}

async function sendMetaEvent(credentials: NonNullable<PixelWarmupCredentials['meta']>, eventType: string, record: PixelWarmupRecord) {
  const email = sanitizeEmail(record.email)
  const phone = sanitizePhone(record.phone)
  const firstName = String(record.first_name || '').trim()
  const lastName = String(record.last_name || '').trim()
  const city = String(record.city || '').trim()
  const state = String(record.state || '').trim()
  const zip = String(record.zip || '').trim()
  const country = String(record.country || '').trim()
  const externalId = String(record.external_id || record.externalId || '').trim()
  const fbLoginId = String(record.fb_login_id || record.fbLoginId || '').trim()
  const currency = String(record.currency || record.purchase_currency || '').trim().toUpperCase()
  const rawValue = String(record.value || record.purchase_value || '').trim()
  const value = rawValue ? Number(rawValue) : undefined

  const userData: Record<string, string> = {}
  if (email) userData.em = hashValue(email)
  if (phone) userData.ph = hashValue(phone)
  if (firstName) userData.fn = hashValue(firstName)
  if (lastName) userData.ln = hashValue(lastName)
  if (city) userData.ct = hashValue(city)
  if (state) userData.st = hashValue(state)
  if (zip) userData.zp = hashValue(zip)
  if (country) userData.country = hashValue(country)
  if (externalId) userData.external_id = hashValue(externalId)
  if (fbLoginId) userData.fb_login_id = fbLoginId

  const customData: Record<string, unknown> = {}
  if (firstName) customData.first_name = firstName
  if (lastName) customData.last_name = lastName
  if (currency) customData.currency = currency
  else if (eventType.toLowerCase() === 'purchase') customData.currency = 'USD'
  if (value !== undefined && !Number.isNaN(value)) customData.value = value
  else if (eventType.toLowerCase() === 'purchase') customData.value = 1.0

  const payload = {
    data: [
      {
        event_name: eventType,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: 'https://track.itshassanahmed.com/dashboard/pixel-warmup',
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
      },
    ],
  }

  const endpoint = `https://graph.facebook.com/v18.0/${encodeURIComponent(credentials.pixelId)}/events?access_token=${encodeURIComponent(
    credentials.accessToken || ''
  )}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const bodyText = await res.text()
    throw new Error(`Meta CAPI error ${res.status}: ${bodyText}`)
  }
}

async function processTask(task: PixelWarmupTask) {
  const { eventType, record, credentials } = task

  if (credentials.ga4) {
    await sendGa4Event(credentials.ga4, eventType, record)
  }

  if (credentials.meta) {
    await sendMetaEvent(credentials.meta, eventType, record)
  }
}

function startQueueWorker() {
  if (workerStarted) return
  workerStarted = true

  setInterval(async () => {
    const now = Date.now()
    const due = tasks.filter((task) => task.nextRun <= now)
    if (!due.length) return

    for (const task of due) {
      const job = jobs.get(task.jobId)
      if (!job) {
        tasks.splice(tasks.indexOf(task), 1)
        continue
      }

      try {
        await processTask(task)
        job.sent += 1
        job.queued -= 1
        job.updatedAt = nowIso()
        tasks.splice(tasks.indexOf(task), 1)
        void persistStore()
      } catch (error) {
        task.attempts += 1
        const message = error instanceof Error ? error.message : String(error)
        if (task.attempts > MAX_RETRIES) {
          job.failed += 1
          job.queued -= 1
          job.errors.push({ rowIndex: task.rowIndex, message })
          tasks.splice(tasks.indexOf(task), 1)
          void persistStore()
        } else {
          task.nextRun = Date.now() + getRandomDelayMs()
          job.errors.push({ rowIndex: task.rowIndex, message })
          void persistStore()
        }
        job.updatedAt = nowIso()
      }
    }

    for (const [jobId, job] of jobs.entries()) {
      if (job.queued === 0 && job.status === 'running') {
        job.status = 'completed'
        job.updatedAt = nowIso()
        void persistStore()
      }
    }
  }, QUEUE_POLL_MS)
}

export function startWarmupJob(
  eventType: string,
  rows: PixelWarmupRecord[],
  credentials: PixelWarmupCredentials
) {
  if (!eventType || typeof eventType !== 'string') {
    throw new Error('eventType is required')
  }
  if (!Array.isArray(rows) || !rows.length) {
    throw new Error('At least one row is required')
  }
  if (!credentials.ga4 && !credentials.meta) {
    throw new Error('At least one of GA4 or Meta credentials is required')
  }

  const jobId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const job: PixelWarmupJob = {
    jobId,
    eventType,
    rows: rows.length,
    queued: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    status: 'running',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    errors: [],
  }

  rows.forEach((row, index) => {
    const missing = ['email', 'phone', 'first_name', 'last_name'].filter((field) => {
      const value = String(row[field] || '').trim()
      return !value
    })
    if (missing.length) {
      job.skipped += 1
      job.errors.push({ rowIndex: index + 2, message: `Missing mandatory fields: ${missing.join(', ')}` })
      return
    }

    const task: PixelWarmupTask = {
      jobId,
      rowIndex: index + 2,
      eventType,
      record: {
        ...row,
        email: sanitizeEmail(row.email),
        phone: sanitizePhone(row.phone),
        first_name: String(row.first_name || '').trim(),
        last_name: String(row.last_name || '').trim(),
      },
      credentials,
      attempts: 0,
      nextRun: Date.now() + getRandomDelayMs(),
    }

    tasks.push(task)
    job.queued += 1
  })

  jobs.set(jobId, job)
  void persistStore()
  if (!workerStarted) startQueueWorker()

  return {
    jobId,
    queued: job.queued,
    skipped: job.skipped,
    sent: job.sent,
    failed: job.failed,
    job,
  }
}

export function cancelWarmupJob(jobId: string) {
  const job = jobs.get(jobId)
  if (!job) return false

  for (let i = tasks.length - 1; i >= 0; i -= 1) {
    if (tasks[i].jobId === jobId) {
      tasks.splice(i, 1)
    }
  }

  job.queued = 0
  job.status = 'completed'
  job.updatedAt = nowIso()
  void persistStore()
  return true
}

export function getWarmupJob(jobId: string) {
  return jobs.get(jobId) ?? null
}
