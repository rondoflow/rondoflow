---
name: full-react-19-engineering
description: "Full React 19 engineering, architecture, Server Components, hooks, Zustand, TanStack Query, forms, performance, testing, production deploy."
category: "DevOps & Infra"
author: community
version: "1.0.4"
icon: server
---

# React

Production-grade React engineering. This skill transforms how you build React applications — from component architecture to deployment.

## When to Use

- Building React components, pages, or features
- Implementing state management (useState, Context, Zustand, TanStack Query)
- Working with React 19 (Server Components, use(), Actions)
- Optimizing performance (memo, lazy, Suspense)
- Debugging rendering issues, infinite loops, stale closures
- Setting up project architecture and folder structure

## Architecture Decisions

Before writing code, make these decisions:

| Decision | Options | Default |
|----------|---------|---------|
| Rendering | SPA / SSR / Static / Hybrid | SSR (Next.js) |
| State (server) | TanStack Query / SWR / use() | TanStack Query |
| State (client) | useState / Zustand / Jotai | Zustand if shared |
| Styling | Tailwind / CSS Modules / styled | Tailwind |
| Forms | React Hook Form + Zod / native | RHF + Zod |

**Rule:** Server state (API data) and client state (UI state) are DIFFERENT. Never mix them.

## Component Rules

```tsx
// ✅ The correct pattern
export function UserCard({ user, onEdit }: UserCardProps) {
  // 1. Hooks first (always)
  const [isOpen, setIsOpen] = useState(false)
  
  // 2. Derived state (NO useEffect for this)
  const fullName = `${user.firstName} ${user.lastName}`
  
  // 3. Handlers
  const handleEdit = useCallback(() => onEdit(user.id), [onEdit, user.id])
  
  // 4. Early returns
  if (!user) return null
  
  // 5. JSX (max 50 lines)
  return (...)
}
```

| Rule | Why |
|------|-----|
| Named exports only | Refactoring safety, IDE support |
| Props interface exported | Reusable, documented |
| Max 50 lines JSX | Extract if bigger |
| Max 300 lines file | Split into components |
| Hooks at top | React rules + predictable |

## State Management

```
Is it from an API?
├─ YES → TanStack Query (NOT Redux, NOT Zustand)
└─ NO → Is it shared across components?
    ├─ YES → Zustand (simple) or Context (if rarely changes)
    └─ NO → useState
```

### TanStack Query (Server State)

```tsx
// Query key factory — prevents key typos
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}
```

### Zustand (Client State)

```tsx
// Thin stores, one concern each
export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// ALWAYS use selectors — prevents unnecessary rerenders
const isOpen = useUIStore((s) => s.sidebarOpen)
```

## React 19

### Server Components (Default in Next.js App Router)

```tsx
// Server Component — runs on server, zero JS to client
async function ProductList() {
  const products = await db.products.findMany() // Direct DB access
  return <ul>{products.map(p => <ProductCard key={p.id} product={p} />)}</ul>
}

// Client Component — needs 'use client' directive
'use client'
function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  return <button onClick={() => addToCart(productId)}>Add</button>
}
```

| Server Component | Client Component |
|------------------|------------------|
| async/await ✅ | useState ✅ |
| Direct DB ✅ | onClick ✅ |
| No bundle size | Adds to bundle |
| useState ❌ | async ❌ |

### use() Hook

```tsx
// Read promises in render (with Suspense)
function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise) // Suspends until resolved
  return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>
}
```

### useActionState (Forms)

```tsx
'use client'
async function submitAction(prev: State, formData: FormData) {
  'use server'
  // ... server logic
  return { success: true }
}

function Form() {
  const [state, action, pending] = useActionState(submitAction, {})
  return (
    <form action={action}>
      <input name="email" disabled={pending} />
      <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
      {state.error && <p>{state.error}</p>}
    </form>
  )
}
```

## Performance

| Priority | Technique | Impact |
|----------|-----------|--------|
| P0 | Route-based code splitting | 🔴 High |
| P0 | Image optimization (next/image) | 🔴 High |
| P1 | Virtualize long lists (tanstack-virtual) | 🟡 Medium |
| P1 | Debounce expensive operations | 🟡 Medium |
| P2 | React.memo on expensive components | 🟢 Low-Med |
| P2 | useMemo for expensive calculations | 🟢 Low-Med |

**React Compiler (React 19+):** Auto-memoizes. Remove manual memo/useMemo/useCallback.

## Common Traps

### Rendering Traps

```tsx
// ❌ Renders "0" when count is 0
{count && <Component />}

// ✅ Explicit boolean
{count > 0 && <Component />}
```

```tsx
// ❌ Mutating state — React won't detect
array.push(item)
setArray(array)

// ✅ New reference
setArray([...array, item])
```

```tsx
// ❌ New key every render — destroys component
<Item key={Math.random()} />

// ✅ Stable key
<Item key={item.id} />
```

### Hooks Traps

```tsx
// ❌ useEffect cannot be async
useEffect(async () => { ... }, [])

// ✅ Define async inside
useEffect(() => {
  async function load() { ... }
  load()
}, [])
```

```tsx
// ❌ Missing cleanup — memory leak
useEffect(() => {
  const sub = subscribe()
}, [])

// ✅ Return cleanup
useEffect(() => {
  const sub = subscribe()
  return () => sub.unsubscribe()
}, [])
```

```tsx
// ❌ Object in deps — triggers every render
useEffect(() => { ... }, [{ id: 1 }])

// ✅ Extract primitives or memoize
useEffect(() => { ... }, [id])
```

### Data Fetching Traps

```tsx
// ❌ Sequential fetches — slow
const users = await fetchUsers()
const orders = await fetchOrders()

// ✅ Parallel
const [users, orders] = await Promise.all([fetchUsers(), fetchOrders()])
```

```tsx
// ❌ Race condition — no abort
useEffect(() => {
  fetch(url).then(setData)
}, [url])

// ✅ Abort controller
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal }).then(setData)
  return () => controller.abort()
}, [url])
```

## AI Mistakes to Avoid

Common errors AI assistants make with React:

| Mistake | Correct Pattern |
|---------|-----------------|
| useEffect for derived state | Compute inline: `const x = a + b` |
| Redux for API data | TanStack Query for server state |
| Default exports | Named exports: `export function X` |
| Index as key in dynamic lists | Stable IDs: `key={item.id}` |
| Fetching in useEffect | TanStack Query or loader patterns |
| Giant components (500+ lines) | Split at 50 lines JSX, 300 lines file |
| No error boundaries | Add at app, feature, component level |
| Ignoring TypeScript strict | Enable strict: true, fix all errors |

## Quick Reference

### Hooks

| Hook | Purpose |
|------|---------|
| useState | Local state |
| useEffect | Side effects (subscriptions, DOM) |
| useCallback | Stable function reference |
| useMemo | Expensive calculation |
| useRef | Mutable ref, DOM access |
| use() | Read promise/context (React 19) |
| useActionState | Form action state (React 19) |
| useOptimistic | Optimistic UI (React 19) |

### File Structure

```
src/
├── app/                 # Routes (Next.js)
├── features/            # Feature modules
│   └── auth/
│       ├── components/  # Feature components
│       ├── hooks/       # Feature hooks
│       ├── api/         # API calls
│       └── index.ts     # Public exports
├── shared/              # Cross-feature
│   ├── components/ui/   # Button, Input, etc.
│   └── hooks/           # useDebounce, etc.
└── providers/           # Context providers
```

## Setup

See `setup.md` for first-time configuration. Uses `memory-template.md` for project tracking.

## Core Rules

1. **Server state ≠ client state** — API data goes in TanStack Query, UI state in useState/Zustand. Never mix.
2. **Named exports only** — `export function X` not `export default`. Enables safe refactoring.
3. **Colocate, then extract** — Start with state near usage. Lift only when needed.
4. **No useEffect for derived state** — Compute inline: `const total = items.reduce(...)`. Effects are for side effects.
5. **Stable keys always** — Use `item.id`, never `index` for dynamic lists.
6. **Max 50 lines JSX** — If bigger, extract components. Max 300 lines per file.
7. **TypeScript strict: true** — No `any`, no implicit nulls. Catch bugs at compile time.

## Related Skills
Install with `clawhub install <slug>` if user confirms:

- **frontend-design-ultimate** — Build complete UIs with React + Tailwind
- **typescript** — TypeScript patterns and strict configuration
- **nextjs** — Next.js App Router and deployment
- **testing** — Testing React components with Testing Library

## Feedback

- If useful: `clawhub star react`
- Stay updated: `clawhub sync`
