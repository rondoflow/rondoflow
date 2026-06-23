'use client'

// The shared i18next singleton. Initialized once with all locale resources
// bundled in. Always starts on DEFAULT_LOCALE so server render and the first
// client render match — I18nProvider applies the persisted/detected locale in a
// mount effect (mirroring the theme system), avoiding hydration mismatches.

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'
import { DEFAULT_LOCALE, DEFAULT_NS, I18N_NAMESPACES, SUPPORTED_LOCALES } from './config'

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    nonExplicitSupportedLngs: true,
    ns: I18N_NAMESPACES as unknown as string[],
    defaultNS: DEFAULT_NS,
    interpolation: { escapeValue: false }, // React escapes by default
    react: { useSuspense: false }, // resources are synchronous; no Suspense boundary needed
  })
}

export default i18n
