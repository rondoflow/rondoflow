'use client'

import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'rondoflow-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>('light')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    const initial = stored ?? 'light'
    setModeState(initial)
    const res = initial === 'system' ? getSystemTheme() : initial
    setResolved(res)
    applyTheme(res)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange(e: MediaQueryListEvent) {
      const newResolved = e.matches ? 'dark' : 'light'
      setResolved(newResolved)
      applyTheme(newResolved)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
    const res = newMode === 'system' ? getSystemTheme() : newMode
    setResolved(res)
    applyTheme(res)
  }, [])

  return { mode, resolved, setMode }
}
