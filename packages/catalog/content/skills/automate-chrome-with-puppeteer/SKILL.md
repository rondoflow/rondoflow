---
name: automate-chrome-with-puppeteer
description: "Automate Chrome and Chromium with Puppeteer for scraping, testing, screenshots, and browser workflows."
category: "Web & Scraping"
author: community
version: "1.0.0"
icon: globe
---

## Setup

On first use, read `setup.md` for integration guidelines.

## When to Use

User needs browser automation: web scraping, E2E testing, PDF generation, screenshots, or any headless Chrome task. Agent handles page navigation, element interaction, waiting strategies, and data extraction.

## Architecture

Scripts and outputs in `~/puppeteer/`. See `memory-template.md` for structure.

```
~/puppeteer/
├── memory.md       # Status + preferences
├── scripts/        # Reusable automation scripts
└── output/         # Screenshots, PDFs, scraped data
```

## Quick Reference

| Topic | File |
|-------|------|
| Setup process | `setup.md` |
| Memory template | `memory-template.md` |
| Selectors guide | `selectors.md` |
| Waiting patterns | `waiting.md` |

## Core Rules

### 1. Always Wait Before Acting
Never click or type immediately after navigation. Always wait for the element:
```javascript
await page.waitForSelector('#button');
await page.click('#button');
```
Clicking without waiting causes "element not found" errors 90% of the time.

### 2. Use Specific Selectors
Prefer stable selectors in this order:
1. `[data-testid="submit"]` — test attributes (most stable)
2. `#unique-id` — IDs
3. `form button[type="submit"]` — semantic combinations
4. `.class-name` — classes (least stable, changes often)

Avoid: `div > div > div > button` — breaks on any DOM change.

### 3. Handle Navigation Explicitly
After clicks that navigate, wait for navigation:
```javascript
await Promise.all([
  page.waitForNavigation(),
  page.click('a.next-page')
]);
```
Without this, the script continues before the new page loads.

### 4. Set Realistic Viewport
Always set viewport for consistent rendering:
```javascript
await page.setViewport({ width: 1280, height: 800 });
```
Default viewport is 800x600 — many sites render differently or show mobile views.

### 5. Handle Popups and Dialogs
Dismiss dialogs before they block interaction:
```javascript
page.on('dialog', async dialog => {
  await dialog.dismiss(); // or dialog.accept()
});
```
Unhandled dialogs freeze the script.

### 6. Close Browser on Errors
Always wrap in try/finally:
```javascript
const browser = await puppeteer.launch();
try {
  // ... automation code
} finally {
  await browser.close();
}
```
Leaked browser processes consume memory and ports.

### 7. Respect Rate Limits
Add delays between requests to avoid blocks:
```javascript
await page.waitForTimeout(1000 + Math.random() * 2000);
```
Hammering sites triggers CAPTCHAs and IP bans.

## Common Traps

- `page.click()` on invisible element → fails silently, use `waitForSelector` with `visible: true`
- Screenshots of elements off-screen → blank image, scroll into view first
- `page.evaluate()` returns undefined → cannot return DOM nodes, only serializable data
- Headless blocked by site → use `headless: 'new'` or set user agent
- Form submit reloads page → `page.waitForNavigation()` or data is lost
- Shadow DOM elements invisible to selectors → use `page.evaluateHandle()` to pierce shadow roots
- Cookies not persisting → launch with `userDataDir` for session persistence

## Security & Privacy

**Data that stays local:**
- All scraped data in ~/puppeteer/output/
- Browser profile in specified userDataDir

**This skill does NOT:**
- Send scraped data anywhere
- Store credentials (you provide them per-script)
- Access files outside ~/puppeteer/

## Related Skills
Install with `clawhub install <slug>` if user confirms:
- `playwright` — Cross-browser automation alternative
- `chrome` — Chrome DevTools and debugging
- `web` — General web development

## Feedback

- If useful: `clawhub star puppeteer`
- Stay updated: `clawhub sync`
