export type FeatureSection = {
  id: string
  tag: string
  title: string
  subtitle: string
  desc: string
  bullets: string[]
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    id: 'server-side',
    tag: 'CORE',
    title: 'Server-Side Tracking',
    subtitle: 'Meta CAPI, Google, TikTok, Snapchat',
    desc: 'Send your conversion events directly from your server to ad platforms. Bypass ad blockers, browser restrictions, and iOS privacy limits.',
    bullets: [
      'Meta Conversions API with 85%+ match rates',
      'Google Enhanced Conversions',
      'TikTok Events API',
      'Snapchat Conversions API',
      'Advanced SHA-256 data hashing',
      'Automatic event deduplication',
    ],
  },
  {
    id: 'data-quality',
    tag: 'ACCURACY',
    title: 'Data Quality',
    subtitle: 'Truth Score™, Match Rate, Payload Validator',
    desc: 'Know exactly how accurate your tracking data is. Our proprietary Truth Score™ gives you a single metric for data quality across all platforms.',
    bullets: [
      'Truth Score™ — 0-100 accuracy metric',
      'Real-time match rate monitoring',
      'Payload validator catches errors before send',
      'Data quality dashboard with recommendations',
      'UTM parameter cleaning',
      'Attribution analysis',
    ],
  },
  {
    id: 'reliability',
    tag: 'RELIABILITY',
    title: 'Reliability',
    subtitle: 'Event Replay, Auto Retry, Deduplication',
    desc: 'Never lose a conversion. Failed events are automatically retried. Duplicates are suppressed. Your data flows reliably, 24/7.',
    bullets: [
      'Automatic event retry on failure',
      'Retry queue with manual requeue',
      'Smart deduplication (event_id)',
      'Failed event replay from logs',
      '99.9% delivery guarantee',
      'Real-time delivery status',
    ],
  },
  {
    id: 'intelligence',
    tag: 'AI POWERED',
    title: 'Intelligence',
    subtitle: 'AI Analysis, Anomaly Detection, Alerts',
    desc: 'AI finds gaps in your tracking automatically. Get alerts in 30 seconds when something breaks. Fix issues before they cost you conversions.',
    bullets: [
      'AI Analysis — finds missing events & suggests fixes',
      'Anomaly detection — volume drops, tracking breaks',
      'Email & webhook alerts',
      'Automated UTM cleaner',
      'Attribution scoring',
      'Health score dashboard',
    ],
  },
  {
    id: 'privacy',
    tag: 'PRIVACY',
    title: 'Privacy & Compliance',
    subtitle: 'Cookie Extender, Reverse Proxy, GDPR',
    desc: 'Extend cookie windows from 7 days to 180 days. Serve tracking scripts from your own domain. Built-in GDPR tools and consent management.',
    bullets: [
      'Cookie Extender — 7 days → 180 days',
      'Reverse proxy — first-party domain serving',
      'GDPR auto-cleanup',
      'PII hashing (SHA-256)',
      'Data deletion requests',
      'Consent mode support',
    ],
  },
  {
    id: 'agency',
    tag: 'AGENCY TOOLS',
    title: 'Agency Tools',
    subtitle: 'Multi-Pixel, Templates, Raw Data',
    desc: 'Manage multiple clients and pixels from one dashboard. 100+ ready-made GTM and sGTM templates. Export raw event data for custom analysis.',
    bullets: [
      'Multi-pixel support (up to 10 on Agency)',
      '100+ GTM and sGTM templates',
      'Raw data export',
      'White-label options (Agency plan)',
      'Workspace separation',
      'Bulk configuration',
    ],
  },
]

