'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// Invite-only: there is no public sign-up route. Only /login is public.
const PUBLIC_PATHS = new Set(['/login'])

export function AuthGuard({ children }: { readonly children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    if (loading) return

    if (!user && !isPublic) {
      router.replace('/login')
    }

    if (user && isPublic) {
      router.replace('/')
    }
  }, [user, loading, isPublic, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !isPublic) return null
  if (user && isPublic) return null

  return <>{children}</>
}
