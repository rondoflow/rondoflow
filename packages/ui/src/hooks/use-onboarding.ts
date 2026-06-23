'use client'

import { useCallback, useEffect, useState } from 'react'

const KEYS = {
  completed: 'rondoflow:onboarding:completed',
} as const

// ─── Reset pub/sub ───────────────────────────────────────────────────────────
// useOnboarding reads localStorage on mount only. When the wizard is completed
// or restarted we notify subscribers so the wizard surface re-reads its state
// without a full page reload.

type ResetListener = () => void
const resetListeners = new Set<ResetListener>()

function subscribeReset(listener: ResetListener): () => void {
  resetListeners.add(listener)
  return () => {
    resetListeners.delete(listener)
  }
}

function emitReset(): void {
  resetListeners.forEach((listener) => listener())
}

/**
 * Restart onboarding: clear the wizard-completed flag so the first-run wizard
 * appears again. Notifies live surfaces immediately (no reload) because
 * useOnboarding re-reads the completed flag on reset.
 */
export function restartOnboarding(): void {
  try {
    localStorage.removeItem(KEYS.completed)
  } catch {
    // localStorage unavailable
  }
  emitReset()
}

// ─── First-run wizard ────────────────────────────────────────────────────────

export interface UseOnboardingReturn {
  /** True when the wizard should be shown (first-time user). */
  readonly showWizard: boolean
  /** Mark the wizard as completed. */
  readonly completeWizard: () => void
}

export function useOnboarding(): UseOnboardingReturn {
  const [showWizard, setShowWizard] = useState(false)

  // Read on mount and re-read on reset, so restartOnboarding() can re-open the
  // wizard live without a page reload.
  useEffect(() => {
    const read = () => {
      try {
        setShowWizard(!localStorage.getItem(KEYS.completed))
      } catch {
        // localStorage unavailable
      }
    }
    read()
    return subscribeReset(read)
  }, [])

  const completeWizard = useCallback(() => {
    try {
      localStorage.setItem(KEYS.completed, 'true')
    } catch {
      // silent
    }
    setShowWizard(false)
  }, [])

  return { showWizard, completeWizard }
}
