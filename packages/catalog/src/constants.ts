// Zod-free constants. Kept separate from `schema.ts` so the package's runtime
// entry point (`index.ts`) can re-export these values WITHOUT pulling Zod into
// the consumer bundle (the UI imports the catalog; Zod must stay server/build
// only). `schema.ts` imports this module to build its enums.

/** Display order for grouped sections in the agent-template gallery. */
export const AGENT_TEMPLATE_CATEGORIES = [
  'Engineering',
  'Data & Analytics',
  'SEO & Search',
  'Content & Marketing',
  'Research & Ops',
] as const

export type AgentTemplateCategory = (typeof AGENT_TEMPLATE_CATEGORIES)[number]
