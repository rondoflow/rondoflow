import { describe, it, expect } from 'vitest'
import { resources } from '../resources'
import { SUPPORTED_LOCALES, I18N_NAMESPACES, DEFAULT_LOCALE } from '../config'

type Flat = Record<string, string>

// Flatten a nested namespace object into dot-joined leaf keys → string values.
function flatten(obj: unknown, prefix = '', out: Flat = {}): Flat {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k
      if (v && typeof v === 'object') flatten(v, key, out)
      else out[key] = String(v)
    }
  }
  return out
}

// i18next CLDR plural suffixes — collapse plural variants to a single base key so
// locales with different plural categories (sk: one/few/other) still match parity.
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/
const baseKey = (key: string) => key.replace(PLURAL_SUFFIX, '')

const VAR_RE = /\{\{\s*([\w-]+)[^}]*\}\}/g
function vars(value: string): Set<string> {
  const found = new Set<string>()
  for (const m of value.matchAll(VAR_RE)) found.add(m[1])
  return found
}

const otherLocales = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE)

describe('i18n locale catalogs', () => {
  it('declares every namespace for every locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const ns of I18N_NAMESPACES) {
        expect(resources[locale], `${locale} missing namespace ${ns}`).toHaveProperty(ns)
      }
    }
  })

  for (const ns of I18N_NAMESPACES) {
    describe(`namespace: ${ns}`, () => {
      const enFlat = flatten(resources[DEFAULT_LOCALE][ns])
      const enBaseKeys = new Set(Object.keys(enFlat).map(baseKey))

      it.each(otherLocales)('%s has the same keys as en (base, plural-insensitive)', (locale) => {
        const locBaseKeys = new Set(Object.keys(flatten(resources[locale][ns])).map(baseKey))
        const missing = [...enBaseKeys].filter((k) => !locBaseKeys.has(k))
        const extra = [...locBaseKeys].filter((k) => !enBaseKeys.has(k))
        expect({ missing, extra }).toEqual({ missing: [], extra: [] })
      })

      it.each(SUPPORTED_LOCALES)('%s has no empty or untranslated values', (locale) => {
        const flat = flatten(resources[locale][ns])
        const empty = Object.entries(flat).filter(([, v]) => v.trim() === '')
        const todo = Object.entries(flat).filter(([, v]) => v.includes('[[TODO]]'))
        expect({ empty: empty.map(([k]) => k), todo: todo.map(([k]) => k) }).toEqual({
          empty: [],
          todo: [],
        })
      })

      it.each(otherLocales)('%s preserves interpolation variables', (locale) => {
        const locFlat = flatten(resources[locale][ns])
        // Compare the union of {{vars}} per base key (handles plural variants).
        const enVars = new Map<string, Set<string>>()
        for (const [k, v] of Object.entries(enFlat)) {
          const set = enVars.get(baseKey(k)) ?? new Set<string>()
          vars(v).forEach((x) => set.add(x))
          enVars.set(baseKey(k), set)
        }
        const locVars = new Map<string, Set<string>>()
        for (const [k, v] of Object.entries(locFlat)) {
          const set = locVars.get(baseKey(k)) ?? new Set<string>()
          vars(v).forEach((x) => set.add(x))
          locVars.set(baseKey(k), set)
        }
        const mismatches: string[] = []
        for (const [key, set] of enVars) {
          const a = [...set].sort()
          const b = [...(locVars.get(key) ?? new Set())].sort()
          if (a.join(',') !== b.join(',')) mismatches.push(`${key}: en[${a}] vs ${locale}[${b}]`)
        }
        expect(mismatches).toEqual([])
      })
    })
  }
})
