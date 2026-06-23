'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Workflow, Github } from 'lucide-react'
import type { SocialAuthProviders } from '@rondoflow/shared'
import { Button } from '@/components/ui/button'
import { getAuthProviders } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const { signIn, signInWithGithub, signInWithGoogle, error, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // null until the providers endpoint resolves — kept null on error so social
  // buttons stay hidden rather than flashing in and then disappearing.
  const [providers, setProviders] = useState<SocialAuthProviders | null>(null)

  useEffect(() => {
    let active = true
    getAuthProviders().then((p) => {
      if (active) setProviders(p)
    })
    return () => {
      active = false
    }
  }, [])

  const showGithub = providers?.github ?? false
  const showGoogle = providers?.google ?? false
  const showSocial = showGithub || showGoogle

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await signIn(email, password)
    // If no error after sign in, redirect to home
    router.push('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br from-zinc-900 via-neutral-900 to-black lg:flex">
        {/* Decorative gradient glow */}
        <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[hsl(var(--status-running)/0.28)] blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-[hsl(var(--status-idle)/0.20)] blur-3xl" />
        <Workflow className="relative h-16 w-16 text-white" />
        <h1 className="relative text-3xl font-bold text-white">RondoFlow</h1>
        <p className="relative max-w-xs text-center text-sm text-white/70">
          {t('brand.tagline')}
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 lg:hidden">
              <Workflow className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">RondoFlow</span>
            </div>
            <h2 className="text-2xl font-bold">{t('signIn.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('signIn.subtitle')}
            </p>
          </div>

          {error && (
            <div className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('field.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('field.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={t('field.passwordPlaceholder')}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signIn.submitting') : t('signIn.submit')}
            </Button>
          </form>

          {showSocial && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t('social.divider')}</span>
                </div>
              </div>

              <div className={showGithub && showGoogle ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
                {showGithub && (
                  <Button variant="outline" onClick={signInWithGithub} disabled={loading}>
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                )}
                {showGoogle && (
                  <Button variant="outline" onClick={signInWithGoogle} disabled={loading}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                )}
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {t('footer.inviteOnly')}
          </p>
        </div>
      </div>
    </div>
  )
}
