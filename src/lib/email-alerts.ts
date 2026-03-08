export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  condition: string // supports legacy + new conditions
  threshold?: number
  eventName?: string
  notifyEmail: string
  cooldownMinutes: number
  lastTriggeredAt?: string | null
  createdAt: string
  // Extended fields
  condition_group?: string
  platform?: string
  pixel_id?: string
  time_window?: string
  currency?: string
  threshold_hours?: number
  custom_event_name?: string
  custom_field?: string
  custom_operator?: string
  custom_value?: string
  frequency?: string
}

export interface AlertLog {
  id: string
  ruleId: string
  ruleName: string
  triggeredAt: string
  condition: string
  value: number
  threshold: number
  emailSentTo: string
  status: 'sent' | 'failed' | 'suppressed'
}

/** Map new condition values to legacy for evaluation (when backend supports both) */
function normalizeCondition(condition: string): string {
  const map: Record<string, string> = {
    data_quality_below: 'score_below',
    error_count_exceeds: 'error_spike',
    event_volume_drops: 'event_volume_drop',
  }
  return map[condition] ?? condition
}

export function checkAlertRules(
  rules: AlertRule[],
  metrics: { avgScore: number; matchRate: number; errorCount: number; eventVolume: number }
): AlertRule[] {
  const now = new Date()
  return rules.filter(rule => {
    if (!rule.enabled) return false
    if (rule.lastTriggeredAt) {
      const last = new Date(rule.lastTriggeredAt)
      const diffMinutes = (now.getTime() - last.getTime()) / 60000
      if (diffMinutes < rule.cooldownMinutes) return false
    }
    const c = normalizeCondition(rule.condition)
    const t = rule.threshold ?? 70
    if (c === 'score_below' || c === 'data_quality_below') return metrics.avgScore < t
    if (c === 'match_rate_below') return metrics.matchRate < t
    if (c === 'error_spike' || c === 'error_count_exceeds') return metrics.errorCount > t
    if (c === 'event_volume_drop' || c === 'event_volume_drops') return metrics.eventVolume < t
    return false
  })
}
