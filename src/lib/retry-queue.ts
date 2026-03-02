export interface RetryJob {
  id: string
  user_id: string
  event_id: string
  payload: Record<string, unknown>
  platform: string
  attempt: number
  max_attempts: number
  next_retry_at: string
  last_error: string
  created_at: string
  status: 'pending' | 'retrying' | 'success' | 'exhausted'
}

export function calculateNextRetry(attempt: number): Date {
  const delays = [1, 5, 30, 120]
  const delayMinutes = delays[attempt - 1] ?? 120
  const nextRetry = new Date()
  nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes)
  return nextRetry
}

export function getRetryLabel(attempt: number): string {
  const delays = ['1 minute', '5 minutes', '30 minutes', '2 hours']
  return delays[attempt - 1] ?? '2 hours'
}
