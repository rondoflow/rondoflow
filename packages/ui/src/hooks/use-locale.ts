'use client'

import { useTranslation } from 'react-i18next'
import {
  isAppLocale,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type AppLocale,
} from '@/lib/i18n/config'

// Thin hook for the language selector: the current locale, a setter that switches
// + persists, and the list of supported locales. Use react-i18next's
// `useTranslation` directly for `t` — this hook is only for the locale value.
export function useLocale() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage
  const locale: AppLocale = isAppLocale(current) ? current : 'en'

  const setLocale = (next: AppLocale) => {
    void i18n.changeLanguage(next)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // Persistence is best-effort; the in-memory switch still applies.
    }
  }

  return { locale, setLocale, locales: SUPPORTED_LOCALES }
}
