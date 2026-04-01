import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Flatten nested object to dot-notation keys. Arrays are not traversed. */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    if (val && typeof val === "object" && !Array.isArray(val)) {
      flattenObject(val as Record<string, unknown>, newKey, result)
    } else {
      result[newKey] = val
    }
  }
  return result
}

/** SHA256 hash for PII (email/phone) before sending to ad platforms. */
export function hashField(value: string | number | null | undefined): string {
  if (value == null || value === "") return ""
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex")
}

/** Format a number as currency using user's display preference. Display only; no conversion. */
export function formatCurrency(
  value: number,
  currencyCode: string = 'USD',
  options?: { decimals?: number }
): string {
  const decimals = options?.decimals ?? 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }
}

/** Supported display currencies for dashboard (ISO 4217 codes) */
export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', label: 'Australian Dollar (AUD)' },
  { code: 'JPY', label: 'Japanese Yen (JPY)' },
  { code: 'INR', label: 'Indian Rupee (INR)' },
  { code: 'PKR', label: 'Pakistani Rupee (PKR)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'MXN', label: 'Mexican Peso (MXN)' },
  { code: 'BRL', label: 'Brazilian Real (BRL)' },
] as const

export function parseTimestamp(value: string | number | null | undefined): Date {
  if (value == null || value === '') {
    return new Date(NaN)
  }

  const raw = String(value).trim().replace(' ', 'T')
  const isPlainUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(raw)
  if (isPlainUtc) {
    return new Date(`${raw}Z`)
  }
  return new Date(raw)
}

export function formatLocalTimestamp(
  value: string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const dt = parseTimestamp(value)
  if (Number.isNaN(dt.getTime())) return String(value ?? '')
  return dt.toLocaleString(undefined, options)
}

export function formatLocalDate(
  value: string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const dt = parseTimestamp(value)
  if (Number.isNaN(dt.getTime())) return String(value ?? '')
  return dt.toLocaleDateString(undefined, options)
}

export function formatLocalTime(
  value: string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const dt = parseTimestamp(value)
  if (Number.isNaN(dt.getTime())) return String(value ?? '')
  return dt.toLocaleTimeString(undefined, options)
}
