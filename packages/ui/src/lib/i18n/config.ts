// i18n configuration — constants and helpers shared across the i18n layer.
// Intentionally free of any i18next import so it can be used anywhere (selector,
// detection, tests) without pulling in the runtime instance.

export const SUPPORTED_LOCALES = ['en', 'sk', 'es', 'fr', 'de'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'

// Dedicated raw-string key. NOT under the `rondoflow:settings:` prefix, which is
// reserved for JSON-stringified values via settings-panel's storageGet/storageSet.
export const LOCALE_STORAGE_KEY = 'rondoflow:locale'

// Autonyms — each language shown in its own language (standard locale-switcher UX).
// These are deliberately NOT translated.
export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  sk: 'Slovenčina',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}

// Map an app locale to a BCP-47 tag for Intl date/number formatting.
export const LOCALE_INTL_TAG: Record<AppLocale, string> = {
  en: 'en-US',
  sk: 'sk-SK',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
}

// Every translation namespace. Each maps to one JSON file per locale under
// ./locales/<locale>/<namespace>.json. Keep in sync with resources.ts.
export const I18N_NAMESPACES = [
  'common',
  'shell',
  'canvas',
  'auth',
  'settings',
  'onboarding',
  'notifications',
  'agentDrawer',
  'discussions',
  'analytics',
  'resources',
  'scheduling',
  'git',
  'admin',
  'panelsMisc',
  'app',
] as const

export type I18nNamespace = (typeof I18N_NAMESPACES)[number]

export const DEFAULT_NS: I18nNamespace = 'common'

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value != null && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

// Resolve the locale to use on the client: persisted preference → browser
// language → default. Always returns the default on the server so SSR output is
// deterministic (the real preference is applied post-mount by I18nProvider).
export function detectLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isAppLocale(stored)) return stored
  } catch {
    // localStorage unavailable (private mode / blocked) — fall through.
  }
  const nav = window.navigator?.language?.slice(0, 2).toLowerCase()
  if (isAppLocale(nav)) return nav
  return DEFAULT_LOCALE
}
