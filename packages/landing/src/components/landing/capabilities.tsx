import { Blocks, Bot, Check, Gauge, Server, ShieldCheck, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeading } from './section-heading'

type Group = { accent: string; icon: LucideIcon; title: string; items: string[] }

// The full toolkit, grouped. Every item maps to a real RondoFlow capability
// (engine, canvas node, panel, or platform feature).
const GROUPS: readonly Group[] = [
  {
    accent: '#161616',
    icon: Workflow,
    title: 'Build visually',
    items: [
      'Drag-and-drop canvas',
      'A dozen+ node types - agents, skills, policies, MCP, resources, notes',
      'Conditional branching & parallel DAG runs',
      'Ready-made canvas templates',
      'Generate a workflow from a task description',
    ],
  },
  {
    accent: '#3b82f6',
    icon: Bot,
    title: 'Agents & orchestration',
    items: [
      'Multi-agent workflows with parallel branches',
      'Planner - analyzes and tunes before the run',
      'Director - steers each step mid-run',
      'Advisor - reviews the run and suggests fixes',
      'Multi-agent discussions with facilitators',
      'Claude Code, OpenAI, Perplexity, and Sakana AI',
    ],
  },
  {
    accent: '#21c45d',
    icon: Blocks,
    title: 'Skills, tools & integrations',
    items: [
      'Reusable skills attached to any agent',
      'MCP server connections',
      'Web search & deep research',
      'HTTP requests & webhooks',
      'Send email over SMTP',
      'Save to a database, structure & template output',
      'Local folders as resources',
    ],
  },
  {
    accent: '#e7af08',
    icon: ShieldCheck,
    title: 'Guardrails & control',
    items: [
      'Per-agent security policies (most-restrictive-wins)',
      'Permission modes - plan, edit, full',
      'Tool allow / block lists',
      'Approval gates mid-run',
    ],
  },
  {
    accent: '#a855f7',
    icon: Gauge,
    title: 'Automate & observe',
    items: [
      'Cron-scheduled runs',
      'Live run status, streamed',
      'Activity feed, audit log & analytics',
      'Re-attach to a running workflow',
    ],
  },
  {
    accent: '#14b8a6',
    icon: Server,
    title: 'Own your stack',
    items: [
      'Local-first, self-hosted with Docker',
      'Workspaces & tabs',
      'English, French, German, Slovak, Spanish',
      'Dark & light mode',
      'MIT-licensed & catalog-extensible',
    ],
  },
]

export function Capabilities() {
  return (
    <section id="capabilities" className="border-t border-line bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6" data-reveal>
        <SectionHeading
          eyebrow="Everything it does"
          title="One canvas, the whole toolkit"
          description="From building and securing workflows to running, scheduling, and reviewing them - here is the full set of what RondoFlow can do."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => {
            const Icon = group.icon
            return (
              <div
                key={group.title}
                className="rounded-2xl border border-line bg-paper p-6 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${group.accent}1a`, color: group.accent }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold text-ink">{group.title}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-snug text-muted"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: group.accent }}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
