import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Lightweight unit-test runner for pure library helpers (no DOM). Resolves the
// `@/` alias the same way Next.js does so tests can import from `@/lib/...`.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      // UI is deliberately node-only (pure .ts libs/hooks — no component tests).
      // Limit coverage to .ts so the v8 provider never tries to parse the .tsx
      // component tree, which trips its rolldown-based instrumenter.
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**', '**/*.d.ts'],
    },
  },
})
