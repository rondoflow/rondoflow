import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'

const themeComponents = getThemeComponents()

// Merge the docs-theme MDX components with any per-page overrides. Required by
// Nextra 4 — the catch-all route resolves its <Wrapper> from this export.
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    ...components,
  }
}
