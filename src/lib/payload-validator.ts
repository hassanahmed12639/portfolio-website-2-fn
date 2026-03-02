export interface ValidationResult {
  isValid: boolean
  score: number
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  suggestions: ValidationIssue[]
  willBeAccepted: boolean
  estimatedMatchRate: number
}

export interface ValidationIssue {
  field: string
  message: string
  severity: 'error' | 'warning' | 'suggestion'
  impact: string
}

export function validatePayload(payload: Record<string, unknown>): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  // ─── ERRORS (will cause rejection) ───────────────
  if (!payload.event_name) {
    errors.push({
      field: 'event_name',
      message: 'event_name is required',
      severity: 'error',
      impact: 'Event will be rejected by Meta',
    })
  }

  if (!payload.event_time && !payload.event_name) {
    errors.push({
      field: 'event_time',
      message: 'event_time is required',
      severity: 'error',
      impact: 'Event will be rejected by Meta',
    })
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email))) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      severity: 'error',
      impact: 'Meta will reject malformed email — match rate drops to 0',
    })
  }

  if (payload.phone && String(payload.phone).length < 7) {
    errors.push({
      field: 'phone',
      message: 'Phone number too short',
      severity: 'error',
      impact: 'Invalid phone will be ignored by Meta',
    })
  }

  if (payload.value !== undefined && payload.value !== null && isNaN(Number(payload.value))) {
    errors.push({
      field: 'value',
      message: 'Value must be a number',
      severity: 'error',
      impact: 'Purchase value will not be recorded',
    })
  }

  if (payload.value !== undefined && Number(payload.value) < 0) {
    errors.push({
      field: 'value',
      message: 'Value cannot be negative',
      severity: 'error',
      impact: 'Negative values rejected by Meta',
    })
  }

  // ─── WARNINGS (reduce match rate) ─────────────────
  if (!payload.email && !payload.phone) {
    warnings.push({
      field: 'email/phone',
      message: 'No email or phone provided',
      severity: 'warning',
      impact: 'Match rate drops to ~20% without email or phone',
    })
  }

  if (!payload.fbp) {
    warnings.push({
      field: 'fbp',
      message: 'fbp (Facebook Browser ID) missing',
      severity: 'warning',
      impact: 'Missing fbp reduces match rate by ~20%',
    })
  }

  if (!payload.event_source_url) {
    warnings.push({
      field: 'event_source_url',
      message: 'event_source_url missing',
      severity: 'warning',
      impact: 'Meta recommends including source URL for better attribution',
    })
  }

  if (payload.event_name === 'Purchase' && !payload.value) {
    warnings.push({
      field: 'value',
      message: 'Purchase event missing value',
      severity: 'warning',
      impact: 'Purchase value not tracked — ROAS calculation will be wrong',
    })
  }

  if (payload.event_name === 'Purchase' && !payload.currency) {
    warnings.push({
      field: 'currency',
      message: 'Currency missing on Purchase event',
      severity: 'warning',
      impact: 'Meta defaults to USD — may be wrong for your market',
    })
  }

  // ─── SUGGESTIONS (improve match rate) ─────────────
  if (!payload.phone && payload.email) {
    suggestions.push({
      field: 'phone',
      message: 'Add phone number',
      severity: 'suggestion',
      impact: 'Adding phone increases match rate by ~15%',
    })
  }

  if (!payload.first_name || !payload.last_name) {
    suggestions.push({
      field: 'name',
      message: 'Add customer first and last name',
      severity: 'suggestion',
      impact: 'Name increases match rate by ~10%',
    })
  }

  if (!payload.city && !payload.zip) {
    suggestions.push({
      field: 'location',
      message: 'Add city or zip code',
      severity: 'suggestion',
      impact: 'Location data increases match rate by ~10%',
    })
  }

  if (!payload.fbc) {
    suggestions.push({
      field: 'fbc',
      message: 'fbc missing — visitor may not have come from Meta ad',
      severity: 'suggestion',
      impact: 'fbc confirms ad click — adds 15% to match rate',
    })
  }

  if (!payload.event_id) {
    suggestions.push({
      field: 'event_id',
      message: 'Add event_id for deduplication',
      severity: 'suggestion',
      impact: 'Without event_id, same event may be counted twice',
    })
  }

  // ─── CALCULATE SCORE ──────────────────────────────
  let score = 100
  score -= errors.length * 25
  score -= warnings.length * 10
  score -= suggestions.length * 3
  score = Math.max(0, Math.min(100, score))

  // ─── ESTIMATE MATCH RATE ──────────────────────────
  let matchRate = 0
  if (payload.email) matchRate += 35
  if (payload.phone) matchRate += 25
  if (payload.fbp) matchRate += 20
  if (payload.fbc) matchRate += 10
  if (payload.first_name && payload.last_name) matchRate += 5
  if (payload.city || payload.zip) matchRate += 3
  if (payload.fbclid) matchRate += 2

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    suggestions,
    willBeAccepted: errors.length === 0,
    estimatedMatchRate: Math.min(matchRate, 98),
  }
}
