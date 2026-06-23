// Social proof for an early OSS project: rather than invent testimonials we
// can't stand behind, we lean on the stack RondoFlow is built on - tools the
// audience already trusts - plus an honest GitHub call to action.
const STACK = [
  'Claude Code',
  'Next.js',
  'React Flow',
  'Fastify',
  'PostgreSQL',
  'Prisma',
  'Socket.IO',
  'TypeScript',
]

export function BuiltWith() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-faint">
          Built on tools you already trust
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {STACK.map((name) => (
            <li key={name} className="text-sm font-semibold text-muted">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
