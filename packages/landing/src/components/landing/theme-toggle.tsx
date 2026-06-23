'use client'

import { Moon, Sun } from 'lucide-react'

// Flips the `.dark` class on <html> and persists the choice. Initial state is
// set before paint by the inline script in layout.tsx (no flash); icon swap is
// pure CSS via the `dark:` variant, so there's no hydration mismatch.
export function ThemeToggle({ className = '' }: { className?: string }) {
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark')
    // Keep the browser chrome (theme-color) in sync with the active theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0a0a0a' : '#ffffff')
    try {
      localStorage.setItem('rf-theme', isDark ? 'dark' : 'light')
    } catch {
      // ignore (private mode / storage disabled)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle theme"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper text-ink transition-colors hover:border-ink/30 ${className}`}
    >
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  )
}
