'use client'

import { createContext, useContext } from 'react'

export type ComplexityTier = 'simple' | 'standard' | 'full'

export interface ComplexityContextValue {
  readonly tier: ComplexityTier
  readonly level: number
  readonly isSimple: boolean
  readonly isFull: boolean
}

function tierFromLevel(level: number): ComplexityTier {
  if (level <= 3) return 'simple'
  if (level <= 7) return 'standard'
  return 'full'
}

function buildValue(level: number): ComplexityContextValue {
  const tier = tierFromLevel(level)
  return { tier, level, isSimple: tier === 'simple', isFull: tier === 'full' }
}

// Interface complexity is pinned to the full tier: every feature is always
// visible and the level is not user-configurable.
const DEFAULT_VALUE = buildValue(10)

const noop = () => {}

export const ComplexityContext = createContext<ComplexityContextValue>(DEFAULT_VALUE)

export function useComplexity(): ComplexityContextValue {
  return useContext(ComplexityContext)
}

/**
 * Interface complexity is fixed at the full tier and cannot be changed by the
 * user, so this always returns the full-tier value. Kept as a hook (with a
 * no-op `refresh`) so the provider wiring and existing call sites are unchanged.
 */
export function useComplexityState() {
  return { value: DEFAULT_VALUE, refresh: noop }
}
