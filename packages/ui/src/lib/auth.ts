import { createAuthClient } from 'better-auth/client'
import { NETWORK, type SocialAuthProviders } from '@rondoflow/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL

export const authClient = createAuthClient({
  baseURL: `${API_BASE}/api/auth`,
  fetchOptions: {
    credentials: 'include',
  },
})

export async function signIn(email: string, password: string) {
  return authClient.signIn.email({ email, password })
}

export async function signUp(email: string, password: string, name: string) {
  return authClient.signUp.email({ email, password, name })
}

export async function signOut() {
  return authClient.signOut()
}

export async function getSession() {
  return authClient.getSession()
}

/**
 * Fetches which social sign-in providers the server has configured. Used by the
 * login page to hide GitHub/Google buttons when no OAuth client ID is set.
 * Fails closed (no providers) so a server/network error never shows a button
 * that would lead to a broken OAuth flow.
 */
export async function getAuthProviders(): Promise<SocialAuthProviders> {
  try {
    const res = await fetch(`${API_BASE}/api/auth-providers`, { credentials: 'include' })
    if (!res.ok) return { github: false, google: false }
    const json = (await res.json()) as { data?: Partial<SocialAuthProviders> }
    // Coerce at the trust boundary — a malformed payload (missing keys, or a
    // truthy non-boolean) must never surface a button to a broken OAuth flow.
    return { github: Boolean(json.data?.github), google: Boolean(json.data?.google) }
  } catch {
    return { github: false, google: false }
  }
}

export async function signInWithGithub() {
  return authClient.signIn.social({
    provider: 'github',
    callbackURL: typeof window !== 'undefined' ? window.location.origin : '/',
  })
}

export async function signInWithGoogle() {
  return authClient.signIn.social({
    provider: 'google',
    callbackURL: typeof window !== 'undefined' ? window.location.origin : '/',
  })
}
