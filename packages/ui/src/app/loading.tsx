import { Loader2 } from 'lucide-react'

// ─── Root Loading State ────────────────────────────────────────────────────

export default function RootLoading() {
  return (
    <div
      className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-background"
      aria-label="rondoflow is loading"
      aria-busy
    >
      {/* rondoflow logo mark */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg"
          aria-hidden
        >
          <span className="text-base font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          rondoflow
        </span>
      </div>

      {/* Spinner */}
      <Loader2
        className="h-5 w-5 animate-spin text-muted-foreground"
        aria-hidden
      />

      <span className="sr-only">Loading rondoflow...</span>
    </div>
  )
}
