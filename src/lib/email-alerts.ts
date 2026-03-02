export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  condition: 'score_below' | 'match_rate_below' | 'error_spike' | 'event_volume_drop'
  threshold: number
  eventName?: string
  notifyEmail: string
  cooldownMinutes: number
  lastTriggeredAt?: string | null
  createdAt: string
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
    if (rule.condition === 'score_below') return metrics.avgScore < rule.threshold
    if (rule.condition === 'match_rate_below') return metrics.matchRate < rule.threshold
    if (rule.condition === 'error_spike') return metrics.errorCount > rule.threshold
    if (rule.condition === 'event_volume_drop') return metrics.eventVolume < rule.threshold
    return false
  })
}
