// Comparison data for the /compare page. Facts verified against each tool's
// official site / repo (June 2026); license nuances matter, so they're stated
// precisely (Langflow MIT, Flowise open-core Apache 2.0, Hiveflow & Relay
// proprietary cloud SaaS). Kept fair: competitors solve overlapping-but-
// different problems - the table shows where RondoFlow fits, not who "wins".

export const TOOLS = ['RondoFlow', 'Langflow', 'Flowise', 'Hiveflow.ai', 'Relay.app'] as const
export type ToolName = (typeof TOOLS)[number]

export type Cell =
  | { kind: 'yes' | 'partial' | 'no'; note?: string }
  | { kind: 'text'; text: string }

export type Row = { label: string; cells: Cell[] }

// Cells align with the TOOLS order: [RondoFlow, Langflow, Flowise, Hiveflow, Relay].
export const ROWS: readonly Row[] = [
  {
    label: 'Open source',
    cells: [
      { kind: 'yes', note: 'MIT' },
      { kind: 'yes', note: 'MIT' },
      { kind: 'partial', note: 'Apache 2.0 core + commercial' },
      { kind: 'no', note: 'Proprietary' },
      { kind: 'no', note: 'Proprietary' },
    ],
  },
  {
    label: 'Local-first / self-hosted',
    cells: [
      { kind: 'yes', note: 'Runs on your machine' },
      { kind: 'yes', note: 'Self-host · desktop · cloud' },
      { kind: 'yes', note: 'Self-host · cloud' },
      { kind: 'no', note: 'Cloud SaaS' },
      { kind: 'no', note: 'Cloud SaaS' },
    ],
  },
  {
    label: 'Code & keys stay on your machine',
    cells: [
      { kind: 'yes', note: 'Never leaves your machine' },
      { kind: 'partial', note: 'Only if self-hosted' },
      { kind: 'partial', note: 'Only if self-hosted' },
      { kind: 'no', note: 'Cloud SaaS' },
      { kind: 'no', note: 'Cloud SaaS' },
    ],
  },
  {
    label: 'Runs coding agents (your files + shell)',
    cells: [
      { kind: 'yes', note: 'Claude Code CLI' },
      { kind: 'no', note: 'LLM / tool nodes' },
      { kind: 'no', note: 'LLM / tool nodes' },
      { kind: 'no', note: 'LLM workflow nodes' },
      { kind: 'no', note: 'AI steps' },
    ],
  },
  {
    label: 'Visual canvas',
    cells: [
      { kind: 'yes' },
      { kind: 'yes' },
      { kind: 'yes' },
      { kind: 'yes' },
      { kind: 'partial', note: 'Linear step builder' },
    ],
  },
  {
    label: 'MCP tools & servers',
    cells: [
      { kind: 'yes' },
      { kind: 'yes' },
      { kind: 'yes' },
      { kind: 'yes' },
      { kind: 'no', note: 'App connectors' },
    ],
  },
  {
    label: 'Multi-agent orchestration',
    cells: [
      { kind: 'yes', note: 'DAG + branches' },
      { kind: 'yes', note: 'Agent-as-tool' },
      { kind: 'yes', note: 'Agentflows' },
      { kind: 'yes' },
      { kind: 'partial', note: 'AI steps in a flow' },
    ],
  },
  {
    label: 'Multi-agent discussions & debate',
    cells: [
      { kind: 'yes', note: 'Facilitator-led' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
    ],
  },
  {
    label: 'Per-agent security policies',
    cells: [
      { kind: 'yes', note: 'Tools · paths · permissions' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
    ],
  },
  {
    label: 'Plan · steer · review the run',
    cells: [
      { kind: 'yes', note: 'Planner · Director · Advisor' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
    ],
  },
  {
    label: 'Generate a workflow from a prompt',
    cells: [
      { kind: 'yes', note: 'AI workflow generator' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'no' },
      { kind: 'partial', note: 'Natural-language builder' },
    ],
  },
  {
    label: 'Built-in scheduling (cron)',
    cells: [
      { kind: 'yes' },
      { kind: 'no', note: 'Via API / external' },
      { kind: 'no', note: 'Via API / external' },
      { kind: 'yes' },
      { kind: 'yes' },
    ],
  },
  {
    label: 'Models',
    cells: [
      { kind: 'text', text: 'Claude Code + OpenAI + Perplexity + Sakana AI' },
      { kind: 'text', text: 'Model-agnostic' },
      { kind: 'text', text: 'Model-agnostic' },
      { kind: 'text', text: 'Multi-model' },
      { kind: 'text', text: 'Claude · OpenAI · Gemini' },
    ],
  },
  {
    label: 'Best for',
    cells: [
      { kind: 'text', text: 'Coding agents on your codebase' },
      { kind: 'text', text: 'RAG & LLM apps / APIs' },
      { kind: 'text', text: 'LLM apps & agentflows' },
      { kind: 'text', text: 'Enterprise agent automation' },
      { kind: 'text', text: 'No-code SaaS automation' },
    ],
  },
  {
    label: 'Pricing',
    cells: [
      { kind: 'text', text: 'Free · OSS (pay only Claude usage)' },
      { kind: 'text', text: 'Free OSS + paid cloud' },
      { kind: 'text', text: 'Free self-host + paid cloud' },
      { kind: 'text', text: 'From ~$397/mo' },
      { kind: 'text', text: 'Free – ~$59+/mo' },
    ],
  },
]

export type Competitor = {
  name: string
  url: string
  oneLiner: string
  license: string
  hosting: string
  bestFor: string
  vs: string
}

export const COMPETITORS: readonly Competitor[] = [
  {
    name: 'Langflow',
    url: 'https://www.langflow.org/',
    oneLiner: 'Open-source visual builder for LLM apps, RAG pipelines, and agents.',
    license: 'MIT',
    hosting: 'Self-host · desktop · cloud',
    bestFor: 'Prototyping RAG chatbots and LLM APIs, fully model-agnostic.',
    vs: 'Builds LLM/RAG apps you deploy as APIs or MCP servers - it doesn’t spawn coding agents with shell and file access on your machine, and has no per-agent security policies.',
  },
  {
    name: 'Flowise',
    url: 'https://flowiseai.com/',
    oneLiner: 'Visual platform for agentic systems and LLM apps (Agentflows).',
    license: 'Apache 2.0 core (open core)',
    hosting: 'Self-host · cloud',
    bestFor: 'Supervisor/worker agentflows, RAG, and embeddable chatbots.',
    vs: 'Server- and cloud-centric LLM orchestration. Great for chat/RAG, but it doesn’t run the Claude Code CLI locally or enforce per-agent guardrails over real file and shell access.',
  },
  {
    name: 'Hiveflow.ai',
    url: 'https://hiveflow.ai/',
    oneLiner: 'Proprietary cloud platform for multi-agent business automation.',
    license: 'Proprietary',
    hosting: 'Cloud SaaS',
    bestFor: 'Hosted, enterprise multi-agent automation (e.g. finance ops).',
    vs: 'Closed-source and cloud-only. Its agents are LLM workflow nodes in someone else’s datacenter - not coding agents running locally on your code.',
  },
  {
    name: 'Relay.app',
    url: 'https://www.relay.app/',
    oneLiner: 'No-code AI workflow automation across 200+ apps, with human approvals.',
    license: 'Proprietary',
    hosting: 'Cloud SaaS',
    bestFor: 'Non-technical teams automating SaaS busywork with AI steps.',
    vs: 'A Zapier-style automation tool that connects apps with AI steps - a different audience from developers orchestrating coding agents on their machine.',
  },
]

export const CHOOSE: readonly { need: string; pick: string }[] = [
  { need: 'Embed a RAG chatbot or ship an LLM API', pick: 'Langflow or Flowise' },
  { need: 'Automate SaaS busywork with approvals, no code', pick: 'Relay.app' },
  { need: 'Buy a hosted, enterprise multi-agent platform', pick: 'Hiveflow.ai' },
  {
    need: 'Run real coding agents on your own machine - open source, with guardrails',
    pick: 'RondoFlow',
  },
]
