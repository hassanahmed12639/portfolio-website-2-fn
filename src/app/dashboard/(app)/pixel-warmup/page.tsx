'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const REQUIRED_FIELDS = ['email', 'phone', 'first_name', 'last_name']
const MAX_EVENTS_PER_DAY = 100
const PIXEL_WARMUP_HISTORY_KEY = 'pixelWarmupHistory'
const PIXEL_WARMUP_CURRENT_JOB_KEY = 'pixelWarmupCurrentJobId'
const PIXEL_WARMUP_LOG_KEY = 'pixelWarmupLogMessages'
const PIXEL_WARMUP_CREDENTIALS_KEY = 'pixelWarmupCredentials'

type WarmupJobStatus = {
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

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

function splitCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }
    if (char === ',' && !insideQuotes) {
      values.push(current)
      current = ''
      continue
    }
    current += char
  }

  values.push(current)
  return values
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return []
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader)
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    const record: Record<string, string> = {}
    headers.forEach((key, index) => {
      record[key] = values[index]?.trim() ?? ''
    })
    return record
  })
}

function isSpreadsheetFile(fileName: string) {
  return /\.(xlsv|xlsx)$/i.test(fileName)
}

function rowsToRecords(rows: Array<Array<any>>) {
  if (!rows.length) return []
  const headers = rows[0].map((header) => normalizeHeader(String(header || '')))
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((key, index) => {
      record[key] = row[index] !== undefined ? String(row[index]).trim() : ''
    })
    return record
  })
}

async function parseSpreadsheet(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []
  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as Array<Array<any>>
  return rowsToRecords(rows)
}

function validateRecord(record: Record<string, string>, rowIndex: number) {
  const missing = REQUIRED_FIELDS.filter((field) => {
    const key = normalizeHeader(field)
    return !record[key] || record[key].trim().length === 0
  })

  if (missing.length) {
    throw new Error(`Row ${rowIndex + 2}: missing required fields: ${missing.join(', ')}`)
  }
}

function getRandomDelay() {
  return 60000 + Math.floor(Math.random() * 60000)
}

export default function DashboardPixelWarmupPage() {
  const [eventType, setEventType] = React.useState<'Lead' | 'Purchase'>('Lead')
  const [fileName, setFileName] = React.useState('')
  const [recordCount, setRecordCount] = React.useState(0)
  const [records, setRecords] = React.useState<Array<Record<string, string>>>([])
  const [platformOption, setPlatformOption] = React.useState<'ga4' | 'meta' | 'both'>('both')
  const [ga4Id, setGa4Id] = React.useState('')
  const [ga4Secret, setGa4Secret] = React.useState('')
  const [pixelId, setPixelId] = React.useState('')
  const [isRunning, setIsRunning] = React.useState(false)
  const [sentCount, setSentCount] = React.useState(0)
  const [failedCount, setFailedCount] = React.useState(0)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [logMessages, setLogMessages] = React.useState<string[]>([])
  const [error, setError] = React.useState('')
  const [warning, setWarning] = React.useState('')
  const [currentJobId, setCurrentJobId] = React.useState('')
  const [currentJob, setCurrentJob] = React.useState<WarmupJobStatus | null>(null)
  const [isRestoringJob, setIsRestoringJob] = React.useState(false)
  const [jobHistory, setJobHistory] = React.useState<Array<{
    jobId: string
    eventType: string
    rows: number
    queued: number
    skipped: number
    sent: number
    failed: number
    status: 'running' | 'completed'
    createdAt: string
  }>>([])

  const fetchJobStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/dashboard/pixel-warmup?jobId=${encodeURIComponent(jobId)}`, {
        cache: 'no-store',
      })
      const json = await res.json()
      if (res.ok && json.success && json.job) {
        setCurrentJob(json.job as WarmupJobStatus)
        setCurrentJobId(jobId)
        window.localStorage.setItem(PIXEL_WARMUP_CURRENT_JOB_KEY, jobId)
        return
      }

      const notFound = res.status === 404 || String(json?.error || '').toLowerCase().includes('not found')
      if (notFound) {
        setCurrentJob(null)
        setCurrentJobId('')
        window.localStorage.removeItem(PIXEL_WARMUP_CURRENT_JOB_KEY)
      }
    } catch {
      // ignore network errors while polling
    }
  }

  React.useEffect(() => {
    const loadIntegrationDefaults = async () => {
      try {
        const res = await fetch('/api/dashboard/pixel-warmup/credentials', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (json.ga4?.measurementId) setGa4Id(json.ga4.measurementId)
        if (json.ga4?.apiSecret) setGa4Secret(json.ga4.apiSecret)
        if (json.meta?.pixelId) setPixelId(json.meta.pixelId)

        if (json.ga4 && !json.meta) setPlatformOption('ga4')
        else if (json.meta && !json.ga4) setPlatformOption('meta')
        else if (json.ga4 && json.meta) setPlatformOption('both')
      } catch {
        // ignore silently
      }
    }

    const rawCredentials = window.localStorage.getItem(PIXEL_WARMUP_CREDENTIALS_KEY)
    if (rawCredentials) {
      try {
        const parsed = JSON.parse(rawCredentials) as {
          ga4Id?: string
          ga4Secret?: string
          pixelId?: string
        }
        if (parsed.ga4Id) setGa4Id(parsed.ga4Id)
        if (parsed.ga4Secret) setGa4Secret(parsed.ga4Secret)
        if (parsed.pixelId) setPixelId(parsed.pixelId)

        if (parsed.ga4Id || parsed.ga4Secret) {
          setPlatformOption(parsed.pixelId ? 'both' : 'ga4')
        } else if (parsed.pixelId) {
          setPlatformOption('meta')
        }
      } catch {
        // ignore invalid saved credentials
        loadIntegrationDefaults()
      }
    } else {
      loadIntegrationDefaults()
    }

    const rawHistory = window.localStorage.getItem(PIXEL_WARMUP_HISTORY_KEY)
    let parsedHistory: Array<{ jobId: string; rows: number; skipped: number; sent?: number; failed?: number; status?: string }> | null = null
    if (rawHistory) {
      try {
        const parsed = JSON.parse(rawHistory)
        if (Array.isArray(parsed)) {
          setJobHistory(parsed)
          parsedHistory = parsed
        }
      } catch {
        // ignore invalid history
      }
    }

    const rawLogMessages = window.localStorage.getItem(PIXEL_WARMUP_LOG_KEY)
    if (rawLogMessages) {
      try {
        const parsedLog = JSON.parse(rawLogMessages)
        if (Array.isArray(parsedLog)) {
          setLogMessages(parsedLog)
        }
      } catch {
        // ignore invalid logs
      }
    }

    const savedJobId = window.localStorage.getItem(PIXEL_WARMUP_CURRENT_JOB_KEY)
    if (savedJobId) {
      setIsRestoringJob(true)
      setCurrentJobId(savedJobId)
      void fetchJobStatus(savedJobId).finally(() => setIsRestoringJob(false))
    } else if (parsedHistory) {
      const runningJob = parsedHistory.find((entry) => {
        if (entry.status === 'running') return true
        if (entry.status === 'completed') return false
        const sent = typeof (entry as any).sent === 'number' ? (entry as any).sent : 0
        const failed = typeof (entry as any).failed === 'number' ? (entry as any).failed : 0
        const skipped = typeof (entry as any).skipped === 'number' ? (entry as any).skipped : 0
        return sent + failed + skipped < entry.rows
      })
      if (runningJob?.jobId) {
        setIsRestoringJob(true)
        setCurrentJobId(runningJob.jobId)
        void fetchJobStatus(runningJob.jobId).finally(() => setIsRestoringJob(false))
      }
    }
  }, [])

  React.useEffect(() => {
    if (!currentJob) return

    const updatedHistory = jobHistory.map((entry) => {
      if (entry.jobId !== currentJob.jobId) return entry
      return {
        ...entry,
        queued: currentJob.queued,
        sent: currentJob.sent,
        failed: currentJob.failed,
        skipped: currentJob.skipped,
        status: currentJob.status,
      }
    })

    setJobHistory(updatedHistory)
    window.localStorage.setItem(PIXEL_WARMUP_HISTORY_KEY, JSON.stringify(updatedHistory))
  }, [currentJob])

  React.useEffect(() => {
    window.localStorage.setItem(PIXEL_WARMUP_LOG_KEY, JSON.stringify(logMessages))
  }, [logMessages])

  React.useEffect(() => {
    const credentials = {
      ga4Id: ga4Id || undefined,
      ga4Secret: ga4Secret || undefined,
      pixelId: pixelId || undefined,
    }
    window.localStorage.setItem(PIXEL_WARMUP_CREDENTIALS_KEY, JSON.stringify(credentials))
  }, [ga4Id, ga4Secret, pixelId])

  React.useEffect(() => {
    if (!currentJobId) return

    const interval = window.setInterval(() => {
      fetchJobStatus(currentJobId)
    }, 10000)

    return () => window.clearInterval(interval)
  }, [currentJobId])

  const activeRows = currentJob ? currentJob.rows : recordCount
  const activeSent = currentJob ? currentJob.sent : sentCount
  const activeFailed = currentJob ? currentJob.failed : failedCount
  const activeSkipped = currentJob ? currentJob.skipped : 0
  const progress = activeRows ? Math.round(((activeSent + activeFailed + activeSkipped) / activeRows) * 100) : 0

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = event.target.files?.[0]
    if (!file) return

    let parsed: Array<Record<string, string>> = []
    if (isSpreadsheetFile(file.name)) {
      parsed = await parseSpreadsheet(file)
    } else {
      const text = await file.text()
      parsed = parseCsv(text)
    }

    if (!parsed.length) {
      setError('CSV file is empty or invalid. Please upload a valid CSV file.')
      setWarning('')
      setRecords([])
      setFileName('')
      setRecordCount(0)
      return
    }

    if (parsed.length > MAX_EVENTS_PER_DAY) {
      const trimmed = parsed.slice(0, MAX_EVENTS_PER_DAY)
      setWarning(`Only the first ${MAX_EVENTS_PER_DAY} rows are loaded because the daily limit is ${MAX_EVENTS_PER_DAY}.`)
      parsed = trimmed
    } else {
      setWarning('')
    }

    try {
      parsed.forEach((record, index) => validateRecord(record, index))
      setRecords(parsed)
      setFileName(file.name)
      setRecordCount(parsed.length)
      setLogMessages((messages) => [...messages, `Loaded ${parsed.length} rows from ${file.name}`])
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : String(validationError))
      setRecords([])
      setRecordCount(0)
      setFileName('')
    }
  }

  const downloadTemplateCsv = () => {
    const headers = [
      'email',
      'phone',
      'first_name',
      'last_name',
      'city',
      'state',
      'zip',
      'country',
      'external_id',
      'currency',
      'value',
    ]

    const sampleValues = headers.map((header) => {
      switch (header) {
        case 'email':
          return 'test@example.com'
        case 'phone':
          return '+1234567890'
        case 'first_name':
          return 'Jane'
        case 'last_name':
          return 'Doe'
        case 'city':
          return 'Austin'
        case 'state':
          return 'TX'
        case 'zip':
          return '78701'
        case 'country':
          return 'US'
        case 'external_id':
          return '12345'
        case 'currency':
          return 'USD'
        case 'value':
          return '1.00'
        default:
          return ''
      }
    })

    const csv = [headers.join(','), sampleValues.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pixel-warmup-template-${eventType.toLowerCase()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleStart = async () => {
    setError('')
    if (!records.length) {
      setError('Please upload a CSV file and make sure it contains valid rows.')
      return
    }
    if (platformOption !== 'ga4' && platformOption !== 'meta' && platformOption !== 'both') {
      setError('Select a target platform: GA4, Meta, or both.')
      return
    }
    if ((platformOption === 'ga4' || platformOption === 'both') && (!ga4Id || !ga4Secret)) {
      setError('GA4 selected: provide both measurement ID and API secret.')
      return
    }
    if ((platformOption === 'meta' || platformOption === 'both') && !pixelId) {
      setError('Meta selected: provide a pixel ID.')
      return
    }

    setIsRunning(true)
    setSentCount(0)
    setFailedCount(0)
    setCurrentIndex(0)
    setLogMessages((messages) => [...messages, 'Submitting warmup job to server...'])

    try {
      const credentials: Record<string, unknown> = {}
      if (platformOption === 'ga4' || platformOption === 'both') {
        credentials.ga4 = { measurementId: ga4Id, apiSecret: ga4Secret }
      }
      if (platformOption === 'meta' || platformOption === 'both') {
        credentials.meta = { pixelId }
      }

      const res = await fetch('/api/dashboard/pixel-warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          rows: records,
          credentials,
        }),
      })

      const body = await res.json()
      if (!res.ok || body.success === false) {
        setError(body.error || body.message || 'Failed to queue warmup job')
        setLogMessages((messages) => [...messages, `Server queue failed: ${body.error || body.message || res.statusText}`])
      } else {
        setLogMessages((messages) => [
          ...messages,
          `Warmup job queued successfully. Job ID: ${body.jobId}.`,
          'The server will continue sending warmup events even if you close this page.',
        ])

        if (body.jobId) {
          const entry = {
            jobId: body.jobId,
            eventType,
            rows: records.length,
            queued: body.queued ?? records.length,
            skipped: body.skipped ?? 0,
            sent: 0,
            failed: 0,
            status: 'running' as const,
            createdAt: new Date().toISOString(),
          }
          const nextHistory = [entry, ...(jobHistory || [])].slice(0, 20)
          setJobHistory(nextHistory)
          window.localStorage.setItem(PIXEL_WARMUP_HISTORY_KEY, JSON.stringify(nextHistory))
          window.localStorage.setItem(PIXEL_WARMUP_CURRENT_JOB_KEY, body.jobId)
          setCurrentJobId(body.jobId)
          setCurrentJob({
            jobId: body.jobId,
            eventType,
            rows: records.length,
            queued: body.queued ?? records.length,
            sent: 0,
            failed: 0,
            skipped: body.skipped ?? 0,
            status: 'running',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            errors: [],
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLogMessages((messages) => [...messages, `Warmup request failed: ${err instanceof Error ? err.message : String(err)}`])
    } finally {
      setIsRunning(false)
    }
  }

  const handleCancelCurrentJob = async () => {
    if (!currentJob?.jobId) return

    setIsRunning(true)
    setError('')
    setLogMessages((messages) => [...messages, 'Cancelling warmup job...'])

    try {
      const res = await fetch(`/api/dashboard/pixel-warmup?jobId=${encodeURIComponent(currentJob.jobId)}`, {
        method: 'DELETE',
      })
      const body = await res.json()
      if (!res.ok || body.success === false) {
        const message = body.error || body.message || res.statusText
        setError(message)
        setLogMessages((messages) => [...messages, `Cancel failed: ${message}`])
        return
      }

      const updatedJob = {
        ...currentJob,
        status: 'completed' as const,
        queued: 0,
        updatedAt: new Date().toISOString(),
      }
      setCurrentJob(updatedJob)
      const updatedHistory = jobHistory.map((entry) =>
        entry.jobId === updatedJob.jobId ? { ...entry, status: 'completed' as const, queued: 0 } : entry
      )
      setJobHistory(updatedHistory)
      window.localStorage.setItem(PIXEL_WARMUP_HISTORY_KEY, JSON.stringify(updatedHistory))
      setLogMessages((messages) => [...messages, `Warmup job ${currentJob.jobId} cancelled.`])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLogMessages((messages) => [...messages, `Cancel failed: ${err instanceof Error ? err.message : String(err)}`])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)] px-6 py-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-8 shadow-[var(--dash-shadow)]">
        <div className="mb-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--dash-primary)] font-semibold">Dashboard Tool</p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--dash-text)]">Pixel Warmup</h1>
          <p className="max-w-3xl text-sm text-[var(--dash-muted)]">
            Upload a CSV, choose event type, and start warming up server-side pixels using GA4 and Meta production conversion events. The warmup job continues on the server after you close this page.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--dash-text)]">Event type</label>
                <select
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value as 'Lead' | 'Purchase')}
                  disabled={isRunning}
                  className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none"
                >
                  <option value="Lead">Lead</option>
                  <option value="Purchase">Purchase</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--dash-text)]">CSV file</label>
                <input
                  type="file"
                  accept=".csv,.xlsv,.xlsx"
                  disabled={isRunning}
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)]"
                />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button type="button" variant="secondary" onClick={downloadTemplateCsv} disabled={isRunning}>
                    Download template CSV
                  </Button>
                </div>
                {fileName && <p className="mt-2 text-xs text-[var(--dash-muted)]">Loaded: {fileName}</p>}
                {recordCount > 0 && <p className="text-xs text-[var(--dash-muted)]">Rows: {recordCount}</p>}
                {warning && <p className="mt-2 text-xs text-yellow-600">{warning}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--dash-text)]">Send to</label>
                <select
                  value={platformOption}
                  onChange={(event) => setPlatformOption(event.target.value as 'ga4' | 'meta' | 'both')}
                  disabled={isRunning}
                  className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none"
                >
                  <option value="ga4">GA4 only</option>
                  <option value="meta">Meta only</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {platformOption !== 'meta' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--dash-text)]">GA4 Measurement ID</label>
                  <Input
                    value={ga4Id}
                    onChange={(e) => setGa4Id(e.target.value)}
                    disabled={isRunning}
                    placeholder="G-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--dash-text)]">GA4 API Secret</label>
                  <Input
                    type="password"
                    value={ga4Secret}
                    onChange={(e) => setGa4Secret(e.target.value)}
                    disabled={isRunning}
                    placeholder="YOUR_API_SECRET"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {platformOption !== 'ga4' && (
              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--dash-text)]">Meta Pixel ID</label>
                  <Input
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    disabled={isRunning}
                    placeholder="YOUR_PIXEL_ID"
                  />
                </div>
              </div>
            )}

            {error && <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleStart}
                  disabled={isRunning || !records.length}
                  className="w-full sm:w-auto h-11 rounded-2xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold px-6 sm:px-8 shadow-sm"
                >
                  {isRunning ? 'Warming up…' : 'Start warming up'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelCurrentJob}
                  disabled={isRunning || currentJob?.status !== 'running'}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 text-sm font-semibold text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
                >
                  Cancel job
                </Button>
                <Link
                  href="/dashboard/pixel-warmup/history"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 text-sm font-semibold text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
                >
                  View history
                </Link>
              </div>
              <Link href="/dashboard" className="text-sm text-[var(--dash-primary)] hover:underline">
                Back to dashboard
              </Link>
            </div>

            <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-[var(--dash-muted)]">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-sky-600" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[var(--dash-muted)]">
                <div>Sent: {activeSent}</div>
                <div>Failed: {activeFailed}</div>
                <div>Current row: {currentJob ? activeSent + activeFailed + activeSkipped : currentIndex} / {activeRows}</div>
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--dash-text)] mb-3">Instructions</h2>
              <p className="text-sm text-[var(--dash-muted)]">Upload a CSV file with the exact required columns for the selected event type. Then click start and the page will send each row with a random 1–2 minute delay.</p>
              <p className="text-sm text-[var(--dash-muted)]">Required: email, phone, first_name, last_name. Optional fields for better Meta match rate: city, state, zip, country, external_id. Purchase events should also include currency and value.</p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[var(--dash-text)] mb-2">Required fields</h3>
              <div className="rounded-2xl bg-[var(--dash-card)] p-4">
                <p className="text-sm text-[var(--dash-muted)]">All warmup rows require only email, phone, first_name, and last_name.</p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[var(--dash-text)] mb-2">Live status</h3>
              <div className="h-48 overflow-y-auto rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-4 text-xs text-black">
                {currentJob ? (
                  <div className="mb-3 rounded-2xl bg-[var(--dash-surface)] p-3 text-black">
                    <p className="text-sm font-semibold text-black">Current warmup job</p>
                    <p className="text-sm text-black">Job ID: {currentJob.jobId}</p>
                    <p className="text-sm text-black">Status: {currentJob.status}</p>
                    <p className="text-sm text-black">Sent: {currentJob.sent} · Failed: {currentJob.failed} · Skipped: {currentJob.skipped}</p>
                    <p className="text-sm text-black">Queued: {currentJob.queued}</p>
                  </div>
                ) : null}
                {currentJob ? null : isRestoringJob ? (
                  <p className="text-black">Restoring your previous warmup job status…</p>
                ) : logMessages.length === 0 ? (
                  <p className="text-black">No warmup activity yet. Upload a CSV and start warming up to see live status.</p>
                ) : (
                  <ul className="space-y-2">
                    {logMessages.map((message, index) => (
                      <li key={index} className="text-black">{message}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
