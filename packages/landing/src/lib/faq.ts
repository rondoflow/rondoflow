// Shared FAQ content - rendered by the FAQ section and emitted as FAQPage
// JSON-LD, so answers are kept as plain text.
export type FaqItem = { q: string; a: string }

export const FAQ: readonly FaqItem[] = [
  {
    q: 'Is RondoFlow free?',
    a: 'Yes. RondoFlow is open source under the MIT license and free to run yourself - you only pay for your own model usage on your Anthropic, OpenAI, or Perplexity account.',
  },
  {
    q: 'Do I need an API key or a Claude subscription?',
    a: 'You need one Claude credential: either an Anthropic API key or a Claude Code OAuth token from `claude setup-token`. That credential is the only thing forwarded to the agents you run.',
  },
  {
    q: 'Does my code leave my machine?',
    a: 'RondoFlow is local-first: it runs on your machine and executes the Claude Code CLI against your own files and tools. Your code, prompts, and keys stay local - only the messages you send to a model reach that model’s provider.',
  },
  {
    q: 'Which operating systems are supported?',
    a: 'Anywhere Node 20+ and Docker run - macOS, Linux, and Windows via WSL.',
  },
  {
    q: 'How is this different from using Claude Code directly?',
    a: 'Claude Code is a single agent in your terminal. RondoFlow orchestrates many of them on a visual canvas - parallel multi-agent workflows, reusable skills, per-agent guardrails, scheduling, and AI that plans, steers, and reviews each run (Planner, Director, Advisor).',
  },
  {
    q: 'Can I use models other than Claude?',
    a: 'Yes. Alongside Claude Code, agents can run on OpenAI and Perplexity - including web search and deep research - and workflows can call Sakana AI mid-run with the Sakana AI node.',
  },
]
