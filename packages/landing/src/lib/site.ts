// Single source for outbound links and a few page-level constants. Swap `docs`
// to the real documentation subdomain once its DNS is set up - today the docs
// app is served at <app-host>/docs (proxied), with no public subdomain yet.
export const SITE = {
  name: 'RondoFlow',
  tagline: 'Visual orchestration for Claude Code agents',
  repo: 'arzzen/rondoflow',
  url: 'https://rondoflow.dev',
  github: 'https://github.com/arzzen/rondoflow',
  license: 'https://github.com/arzzen/rondoflow/blob/master/LICENSE',
  docs: 'https://docs.rondoflow.dev',

  // Community + project links. All point into the single GitHub repo for now;
  // swap to a dedicated blog/roadmap host if one is ever stood up.
  discussions: 'https://github.com/arzzen/rondoflow/discussions',
  issues: 'https://github.com/arzzen/rondoflow/issues/new/choose',
  changelog: 'https://github.com/arzzen/rondoflow/releases',
  roadmap: 'https://github.com/arzzen/rondoflow/milestones',
  contributing: 'https://github.com/arzzen/rondoflow/blob/master/CONTRIBUTING.md',

  // Product demo video. Drop the recording into `public/` (e.g. public/demo.mp4)
  // and point `demoVideo` at it to light up the "Watch the demo" button in the
  // hero and the VideoObject structured data. Leave it empty to hide both.
  demoVideo: '/demo.webm' as string,
  demoPoster: '/demo-poster.png',
  demoTitle: 'RondoFlow product demo',
  demoDescription:
    'A short walkthrough: drag agents onto the canvas, wire them into a workflow, and run a multi-agent pipeline on your own machine.',
  demoUploadDate: '2026-06-22',
} as const

export type SiteLinks = typeof SITE

// Prefilled "suggest a catalog item" GitHub issue - opens the new-issue form
// with the `catalog` label flag and a short template ready to fill in.
const CATALOG_ISSUE_BODY = `<!-- Suggest a new item for the RondoFlow catalog -->

**Type:** agent / skill / workspace / facilitator / canvas-template

**Name:**

**What it does:**

**Why it belongs in the catalog:**

**Links or references (optional):**
`

export const CATALOG_ISSUE_URL =
  `${SITE.github}/issues/new` +
  `?labels=${encodeURIComponent('catalog')}` +
  `&title=${encodeURIComponent('Catalog: ')}` +
  `&body=${encodeURIComponent(CATALOG_ISSUE_BODY)}`
