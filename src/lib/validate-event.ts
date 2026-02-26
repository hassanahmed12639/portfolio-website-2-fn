export type ValidationCheck = {
  field: string
  label: string
  required: boolean
  passed: boolean
  howToFix: string
}

export type ValidationResult = {
  valid: boolean
  score: number
  checks: ValidationCheck[]
  issues: string[]
}

const RULES: {
  field: string
  label: string
  required: boolean
  check: (e: Record<string, unknown>) => boolean
  howToFix: string
}[] = [
  {
    field: 'event_name',
    label: 'Has event_name',
    required: true,
    check: (e) => !!e.event_name,
    howToFix: 'Include event_name in the payload (e.g. "Purchase", "Lead", "PageView").',
  },
  {
    field: 'event_time',
    label: 'Has timestamp',
    required: true,
    check: (e) => !!(e.event_time ?? e.timestamp),
    howToFix: 'Include event_time (Unix seconds) or timestamp in the payload.',
  },
  {
    field: 'user_data',
    label: 'Has user_data (email or phone)',
    required: false,
    check: (e) => !!(e.email || e.phone || (e.user_data && typeof e.user_data === 'object')),
    howToFix: 'Include email or phone (or user_data) for better attribution.',
  },
  {
    field: 'value',
    label: 'Has value (for Purchase events)',
    required: false,
    check: (e) => {
      const name = String(e.event_name || '').toLowerCase()
      if (name !== 'purchase') return true
      const v = e.value
      return v != null && v !== '' && Number(v) >= 0
    },
    howToFix: 'For Purchase events, always send value (number) for revenue tracking.',
  },
  {
    field: 'currency',
    label: 'Has currency',
    required: false,
    check: (e) => !!e.currency,
    howToFix: 'Include currency (e.g. "USD") for purchase events.',
  },
  {
    field: 'event_id',
    label: 'event_id present (for deduplication)',
    required: false,
    check: (e) => !!e.event_id,
    howToFix: 'Send a unique event_id per event to enable deduplication across pixel and CAPI.',
  },
  {
    field: 'event_source_url',
    label: 'event_source_url present',
    required: false,
    check: (e) => !!e.event_source_url,
    howToFix: 'Include event_source_url (page URL) or rely on server Referer header.',
  },
]

export function validateEvent(event: Record<string, unknown>): ValidationResult {
  const checks: ValidationCheck[] = []
  const issues: string[] = []

  for (const rule of RULES) {
    const passed = rule.check(event)
    checks.push({
      field: rule.field,
      label: rule.label,
      required: rule.required,
      passed,
      howToFix: rule.howToFix,
    })
    if (!passed) {
      if (rule.required) {
        issues.push(`Missing required: ${rule.field}`)
      } else {
        issues.push(`Optional but recommended: ${rule.field}`)
      }
    }
  }

  const requiredFailed = checks.filter((c) => c.required && !c.passed).length
  const optionalFailed = checks.filter((c) => !c.required && !c.passed).length
  const totalRequired = RULES.filter((r) => r.required).length
  const totalOptional = RULES.filter((r) => !r.required).length
  const score = Math.max(
    0,
    100 - requiredFailed * (100 / totalRequired) - optionalFailed * (50 / Math.max(1, totalOptional))
  )

  return {
    valid: requiredFailed === 0,
    score: Math.round(score),
    checks,
    issues,
  }
}
