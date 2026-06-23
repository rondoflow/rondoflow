export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'center' | 'left'
}) {
  const alignment = align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'
  return (
    <div className={alignment}>
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-ink">
        {eyebrow}
      </p>
      <h2 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  )
}
