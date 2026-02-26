'use client'

import { useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const PRESETS: Record<
  string,
  { source: string; medium: string; campaign: string; content: string; term: string }
> = {
  meta_cold: {
    source: 'facebook',
    medium: 'paid-social',
    campaign: 'cold-prospecting',
    content: 'ugc-v1',
    term: '',
  },
  meta_retarget: {
    source: 'facebook',
    medium: 'paid-social',
    campaign: 'retargeting-atc',
    content: 'offer-v1',
    term: '',
  },
  google_brand: {
    source: 'google',
    medium: 'paid-search',
    campaign: 'brand-search',
    content: '',
    term: 'brand-name',
  },
  google_nonbrand: {
    source: 'google',
    medium: 'paid-search',
    campaign: 'nonbrand-search',
    content: '',
    term: 'best-product-keyword',
  },
  tiktok_cold: {
    source: 'tiktok',
    medium: 'paid-social',
    campaign: 'cold-prospecting',
    content: 'spark-v1',
    term: '',
  },
  email: {
    source: 'klaviyo',
    medium: 'email',
    campaign: 'welcome-series',
    content: 'email-1',
    term: '',
  },
}

const PRESET_LABELS: Record<string, string> = {
  meta_cold: 'Meta Cold',
  meta_retarget: 'Meta Retarget',
  google_brand: 'Google Brand',
  google_nonbrand: 'Google Non-Brand',
  tiktok_cold: 'TikTok Cold',
  email: 'Email Flow',
}

const CONVENTIONS = [
  {
    label: 'Always lowercase',
    desc: "UTM values are case-sensitive. 'Facebook' and 'facebook' are different sources in GA4.",
  },
  {
    label: 'Use hyphens, not spaces',
    desc: 'Spaces become %20 in URLs. Hyphens keep things readable and clean.',
  },
  {
    label: 'Be consistent across team',
    desc: 'Define a naming convention doc once. Inconsistency is the #1 cause of broken attribution.',
  },
  {
    label: 'Match platform names exactly',
    desc: "Use the same source names every time — 'meta' or 'facebook', pick one and stick with it.",
  },
]

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  neon,
  dark,
  border,
  labelColor,
  inputTextColor,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
  neon: string
  dark: string
  border: string
  labelColor: string
  inputTextColor: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <label
          style={{
            color: labelColor,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {label}
        </label>
        {required && (
          <span style={{ color: neon, fontSize: 10 }}>Required</span>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: dark,
          border: `1px solid ${value ? `${neon}80` : border}`,
          borderRadius: 10,
          padding: '12px 16px',
          color: inputTextColor,
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = neon
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = value ? `${neon}80` : border
        }}
      />
    </div>
  )
}

export default function UTMBuilder() {
  const { isDarkMode } = useTheme()
  const NEON = '#AAFF00'
  const DARK = isDarkMode ? '#0a0a0a' : '#FFFFFF'
  const CARD = isDarkMode ? '#111111' : '#F5F5F5'
  const BORDER = isDarkMode ? '#1e1e1e' : '#E5E5E5'
  const textColor = isDarkMode ? '#fff' : '#0F0F0F'
  const mutedColor = isDarkMode ? '#555' : '#555'
  const labelColor = isDarkMode ? '#666' : '#555'
  const inputBg = isDarkMode ? '#0a0a0a' : '#FFFFFF'
  const presetBtnColor = isDarkMode ? '#888' : '#333'
  const urlBoxFg = isDarkMode ? '#888' : '#555'
  const urlBoxMuted = isDarkMode ? '#555' : '#444'
  const paramDescColor = isDarkMode ? '#444' : '#555'

  const [url, setUrl] = useState('https://yoursite.com/landing-page')
  const [source, setSource] = useState('facebook')
  const [medium, setMedium] = useState('paid-social')
  const [campaign, setCampaign] = useState('cold-prospecting-q1')
  const [content, setContent] = useState('ugc-hook-v1')
  const [term, setTerm] = useState('')
  const [copied, setCopied] = useState(false)

  const applyPreset = (key: string) => {
    const p = PRESETS[key]
    if (!p) return
    setSource(p.source)
    setMedium(p.medium)
    setCampaign(p.campaign)
    setContent(p.content)
    setTerm(p.term)
  }

  const params = [
    source && `utm_source=${encodeURIComponent(source)}`,
    medium && `utm_medium=${encodeURIComponent(medium)}`,
    campaign && `utm_campaign=${encodeURIComponent(campaign)}`,
    content && `utm_content=${encodeURIComponent(content)}`,
    term && `utm_term=${encodeURIComponent(term)}`,
  ]
    .filter(Boolean)
    .join('&')

  const finalUrl = params ? `${url}?${params}` : url

  const copy = () => {
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      style={{
        background: DARK,
        minHeight: '100%',
        fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
        color: textColor,
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: NEON,
                boxShadow: `0 0 8px ${NEON}`,
              }}
            />
            <span
              style={{
                color: NEON,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Utility Tool
            </span>
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              margin: 0,
              letterSpacing: -1,
            }}
          >
            UTM Builder
          </h1>
          <p
            style={{
              color: mutedColor,
              marginTop: 8,
              fontSize: 15,
            }}
          >
            Generate clean, consistent UTM links. Never have broken attribution
            again.
          </p>
        </div>

        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color: mutedColor,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Quick Presets
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(PRESET_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                style={{
                  background: DARK,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  color: presetBtnColor,
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = NEON
                  e.currentTarget.style.color = NEON
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = BORDER
                  e.currentTarget.style.color = presetBtnColor
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: 28,
            }}
          >
            <div
              style={{
                color: mutedColor,
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Build Your UTM
            </div>
            <Field
              label="Destination URL"
              value={url}
              onChange={setUrl}
              placeholder="https://yoursite.com/page"
              required
              neon={NEON}
              dark={inputBg}
              border={BORDER}
              labelColor={labelColor}
              inputTextColor={textColor}
            />
            <Field
              label="utm_source"
              value={source}
              onChange={setSource}
              placeholder="facebook, google, klaviyo"
              required
              neon={NEON}
              dark={inputBg}
              border={BORDER}
              labelColor={labelColor}
              inputTextColor={textColor}
            />
            <Field
              label="utm_medium"
              value={medium}
              onChange={setMedium}
              placeholder="paid-social, paid-search, email"
              required
              neon={NEON}
              dark={inputBg}
              border={BORDER}
              labelColor={labelColor}
              inputTextColor={textColor}
            />
            <Field
              label="utm_campaign"
              value={campaign}
              onChange={setCampaign}
              placeholder="campaign-name-q1-2025"
              required
              neon={NEON}
              dark={inputBg}
              border={BORDER}
              labelColor={labelColor}
              inputTextColor={textColor}
            />
            <Field
              label="utm_content"
              value={content}
              onChange={setContent}
              placeholder="creative-variant, ad-set-name"
              neon={NEON}
              dark={inputBg}
              border={BORDER}
              labelColor={labelColor}
              inputTextColor={textColor}
            />
            <Field
              label="utm_term"
              value={term}
              onChange={setTerm}
              placeholder="keyword (search only)"
              neon={NEON}
              dark={inputBg}
              border={BORDER}
              labelColor={labelColor}
              inputTextColor={textColor}
            />
          </div>

          <div>
            <div
              style={{
                background: CARD,
                border: `1px solid ${NEON}30`,
                borderRadius: 14,
                padding: 28,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color: mutedColor,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Generated URL
              </div>
              <div
                style={{
                  background: inputBg,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16,
                  wordBreak: 'break-all',
                  fontSize: 12,
                  lineHeight: 1.8,
                  fontFamily: 'monospace',
                  color: urlBoxFg,
                }}
              >
                <span style={{ color: urlBoxMuted }}>{url}</span>
                {params && (
                  <>
                    <span style={{ color: urlBoxMuted }}>?</span>
                    {params.split('&').map((p, i, arr) => (
                      <span key={i}>
                        <span style={{ color: urlBoxFg }}>
                          {p.split('=')[0]}
                        </span>
                        <span style={{ color: urlBoxMuted }}>=</span>
                        <span style={{ color: NEON }}>{p.split('=')[1]}</span>
                        {i < arr.length - 1 && (
                          <span style={{ color: urlBoxMuted }}>&</span>
                        )}
                      </span>
                    ))}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={copy}
                style={{
                  width: '100%',
                  background: copied ? `${NEON}20` : NEON,
                  color: copied ? NEON : textColor,
                  border: `1px solid ${copied ? NEON : 'transparent'}`,
                  borderRadius: 10,
                  padding: '14px',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy URL'}
              </button>
            </div>

            {params && (
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    color: mutedColor,
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  Parameter Breakdown
                </div>
                {[
                  {
                    key: 'utm_source',
                    val: source,
                    desc: 'Where traffic comes from',
                  },
                  {
                    key: 'utm_medium',
                    val: medium,
                    desc: 'Marketing channel type',
                  },
                  {
                    key: 'utm_campaign',
                    val: campaign,
                    desc: 'Campaign name identifier',
                  },
                  content && {
                    key: 'utm_content',
                    val: content,
                    desc: 'Ad creative or variant',
                  },
                  term && {
                    key: 'utm_term',
                    val: term,
                    desc: 'Keyword targeted',
                  },
                ]
                  .filter(Boolean)
                  .map(
                    (p) =>
                      p && (
                        <div
                          key={p.key}
                          style={{
                            display: 'flex',
                            gap: 12,
                            marginBottom: 12,
                            alignItems: 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'monospace',
                              color: urlBoxFg,
                              fontSize: 12,
                              minWidth: 120,
                            }}
                          >
                            {p.key}
                          </div>
                          <div>
                            <div
                              style={{
                                color: NEON,
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {p.val}
                            </div>
                            <div
                              style={{
                                color: paramDescColor,
                                fontSize: 11,
                              }}
                            >
                              {p.desc}
                            </div>
                          </div>
                        </div>
                      )
                  )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: 28,
          }}
        >
          <div
            style={{
              color: mutedColor,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Naming Convention Rules
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONVENTIONS.map((c, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: 12 }}
              >
                <div
                  style={{
                    color: NEON,
                    fontWeight: 900,
                    fontSize: 16,
                    marginTop: 2,
                  }}
                >
                  →
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 4,
                      color: textColor,
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      color: mutedColor,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {c.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
