'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import { detectLocale } from '@/lib/i18n/config'

// Wraps the app in the i18next context. After mount it applies the persisted /
// browser-detected locale (init defaults to English for a clean hydration) and
// keeps <html lang> in sync — the same post-mount-apply pattern use-theme.ts uses
// for the `dark` class.
export function I18nProvider({ children }: { readonly children: React.ReactNode }) {
  useEffect(() => {
    const target = detectLocale()
    if (target !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(target)
    }

    const syncLang = (lng: string) => {
      document.documentElement.lang = lng
    }
    syncLang(i18n.resolvedLanguage ?? target)
    i18n.on('languageChanged', syncLang)
    return () => {
      i18n.off('languageChanged', syncLang)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
