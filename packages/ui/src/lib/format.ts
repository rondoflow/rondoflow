// Locale-aware date/number formatting. Centralizes the native Intl calls so every
// call site honours the active i18n language. Pass `i18n.language` (or the value
// from `useLocale().locale`) as `locale`.

import { LOCALE_INTL_TAG, isAppLocale, DEFAULT_LOCALE } from '@/lib/i18n/config'

function intlTag(locale: string | undefined): string {
  return LOCALE_INTL_TAG[isAppLocale(locale) ? locale : DEFAULT_LOCALE]
}

export function formatDate(
  value: Date | string | number,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(intlTag(locale), options)
}

export function formatTime(
  value: Date | string | number,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString(intlTag(locale), options)
}

export function formatDateTime(
  value: Date | string | number,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(intlTag(locale), options)
}

export function formatNumber(
  value: number,
  locale: string | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString(intlTag(locale), options)
}

// Relative time ("2 hours ago", "yesterday") via Intl.RelativeTimeFormat.
export function formatRelativeTime(
  value: Date | string | number,
  locale: string | undefined,
  now: Date = new Date(),
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(intlTag(locale), { numeric: 'auto' })
  const abs = Math.abs(diffSec)
  if (abs < 60) return rtf.format(diffSec, 'second')
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), 'day')
  if (abs < 2629800) return rtf.format(Math.round(diffSec / 604800), 'week')
  if (abs < 31557600) return rtf.format(Math.round(diffSec / 2629800), 'month')
  return rtf.format(Math.round(diffSec / 31557600), 'year')
}
