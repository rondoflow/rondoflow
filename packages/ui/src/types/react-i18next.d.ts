// react-i18next type configuration.
//
// Keys are intentionally typed as `string` rather than a strict literal union.
// The app relies on two patterns a literal-union key type cannot express:
//   1. cross-namespace lookups via the `common:` prefix (t('common:action.save'))
//      from a hook bound to a different namespace, and
//   2. dynamic keys resolved at render (t(item.labelKey)) for centralized
//      constant arrays (nav-items, command palette, option lists).
// Key correctness is instead guaranteed by the locale catalog test
// (src/lib/i18n/__tests__/locales.test.ts): key parity across en/sk/es, no empty
// values, and interpolation-variable parity. Missing keys fall back to the key /
// fallbackLng at runtime.
import 'i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: Record<string, Record<string, string>>
  }
}
