---
name: avoid-common-html-mistakes
description: "Avoid common HTML mistakes — accessibility gaps, form pitfalls, and SEO oversights."
category: "Web & Scraping"
author: community
version: "1.0.0"
icon: globe
---

## Layout Shift Prevention
- `width` and `height` on `<img>` even with CSS sizing — browser reserves space before load
- `aspect-ratio` in CSS as fallback — for responsive images without dimensions

## Form Gotchas
- `autocomplete` attribute is specific — `autocomplete="email"`, `autocomplete="new-password"`, not just `on/off`
- `<fieldset>` + `<legend>` required for radio/checkbox groups — screen readers announce the group label
- `inputmode` for virtual keyboard — `inputmode="numeric"` shows number pad without validation constraints
- `enterkeyhint` changes mobile keyboard button — `enterkeyhint="search"`, `enterkeyhint="send"`

## Accessibility Gaps
- Skip link must be first focusable — `<a href="#main" class="skip">Skip to content</a>` before nav
- `<th scope="col">` or `scope="row"` — without scope, screen readers can't associate headers
- `aria-hidden="true"` hides from screen readers — use for decorative icons, not interactive elements
- `role="presentation"` on layout tables — if you must use tables for layout (you shouldn't)

## Link Security
- `target="_blank"` needs `rel="noopener noreferrer"` — `noopener` prevents window.opener access, `noreferrer` hides referrer
- User-generated links need `rel="nofollow ugc"` — `ugc` tells search engines it's user content

## SEO Meta
- `<link rel="canonical">` prevents duplicate content — self-referencing canonical on every page
- `og:image` needs absolute URL — relative paths fail on social platforms
- `twitter:card` values: `summary`, `summary_large_image`, `player` — not arbitrary

## Common Oversights
- `<button type="button">` for non-submit — default is `type="submit"`, triggers form submission
- `<dialog>` element for modals — built-in focus trap and escape handling
- `<details>` + `<summary>` for accordions — no JS needed, accessible by default
- Void elements don't need closing slash — `<img>` not `<img />` in HTML5, though both work
