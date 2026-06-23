---
name: write-tailwind-utility-classes
description: "Write Tailwind utility classes with proper responsive design, dark mode, and configuration."
category: "Content & Writing"
author: community
version: "1.0.0"
icon: pencil
---

## Content Configuration

- `content` array in tailwind.config.js must include ALL files with classes—missing paths = missing styles in production
- Glob patterns: `"./src/**/*.{js,jsx,ts,tsx,html}"` covers nested directories
- Dynamic class names like `bg-${color}-500` won't be detected—use complete class names or safelist
- Check production build size—if unexpectedly small, content paths are wrong

## Responsive Prefixes

- Mobile-first: unprefixed styles apply to all sizes, `md:` applies at medium AND above
- `sm:hidden md:block` means hidden on small, visible on medium+—not "only on medium"
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
- Custom breakpoints in config override defaults—use `extend.screens` to add without replacing

## Dark Mode

- `dark:` prefix requires `darkMode: 'class'` in config—won't work with default media strategy if you need manual toggle
- Dark class on `<html>` or `<body>`, not on individual components
- `dark:bg-gray-900` only applies when ancestor has `class="dark"`
- System preference: `darkMode: 'media'` uses `prefers-color-scheme`

## State Variants

- `hover:`, `focus:`, `active:` work as expected
- `group-hover:` requires `group` class on parent—child reacts to parent hover
- `peer-focus:` requires `peer` class on sibling AND sibling must come first in DOM
- Stack variants: `dark:hover:bg-gray-700` applies on hover in dark mode

## Arbitrary Values

- `bg-[#1da1f2]` for one-off colors—brackets for any arbitrary value
- `w-[calc(100%-2rem)]` for calc expressions
- `grid-cols-[1fr_2fr_1fr]` underscores for spaces in values
- Arbitrary properties: `[mask-type:alpha]` for unsupported CSS properties

## @apply Traps

- `@apply` in component CSS loses responsive/state variants—`@apply hover:bg-blue-500` doesn't work as expected
- Order in `@apply` matters unlike HTML classes—later utilities override earlier
- Prefer HTML classes over `@apply`—easier to maintain, better tree-shaking
- If you must use `@apply`, keep it simple: base styles only

## Configuration

- `extend` adds to defaults: `extend: { colors: { brand: '#xxx' } }` keeps all existing colors
- Top-level replaces defaults: `colors: { brand: '#xxx' }` removes all default colors
- `theme()` function in CSS: `border-color: theme('colors.gray.200')`
- Plugin order matters—later plugins can override earlier ones

## Important Modifier

- `!` prefix forces important: `!mt-4` generates `margin-top: 1rem !important`
- Use sparingly—usually indicates specificity battle that should be fixed
- `important: true` in config makes ALL utilities important—avoid, breaks third-party CSS
- `important: '#app'` scopes specificity to selector—better than global important

## Common Mistakes

- `class="px-4 px-6"` last one wins in stylesheet, not in HTML—both get applied, cascade decides
- Forgetting `overflow-hidden` with `rounded-*` on parent with absolute children
- `h-screen` doesn't account for mobile browser chrome—use `h-dvh` (dynamic viewport height)
- `truncate` needs width constraint or `max-w-*` to actually truncate

## Performance

- JIT is default since v3—generates only used classes, no purge needed
- Avoid `safelist` with patterns like `bg-*`—defeats tree-shaking
- `@layer components` for reusable component styles—proper cascade order
- Large arbitrary values generate unique classes—extract to config if repeated
