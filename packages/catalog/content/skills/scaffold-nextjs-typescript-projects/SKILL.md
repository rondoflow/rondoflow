---
name: scaffold-nextjs-typescript-projects
description: "Generate production-ready Next.js projects with TypeScript, Tailwind CSS, shadcn/ui, and API integration. Use when the user asks to build, create, develop, or scaffold a Next.js application, web app, full-stack project, or frontend with backend integration. Prioritizes modern st…"
category: "Integrations"
author: community
version: "0.1.1"
icon: plug
---

# UI Development

Generate production-ready Next.js projects from natural language, with shadcn/ui components, API integration, type safety, and modern tooling.

## Quick Start (TL;DR)

**Fast path for simple projects:**
1. Create Next.js app → 2. Install shadcn/ui → 3. Build UI → 4. Start with PM2 → 5. Screenshot review → 6. Done

**Live preview:** Projects run on PM2 (port 3002), accessible at `http://localhost:3002` or via nginx proxy if configured.

**Default workflow:** All projects use PM2 for dev server management (prevents port conflicts, ensures single instance).

## Requirements & Optional Features

### Required Dependencies
- **Node.js 18+** and **npm/yarn/pnpm**
- **Git** (for project initialization)

### Optional Features (user can decline)

#### 1. Auto-Revision with Visual Review (requires Chromium)
- **What it does**: Takes screenshots during development to visually review designs and auto-fix issues
- **Installation**: `sudo apt-get install chromium-browser` (Debian/Ubuntu)
- **Privileges**: Read/write access to project files, execute chromium in headless mode
- **If declined**: Manual review only (you describe, user verifies)

#### 2. Live Preview Server (requires Nginx)
- **What it does**: Serves project on external port for live preview during development (useful for mobile testing or remote access)
- **Installation**: `sudo apt-get install nginx`
- **How it works**: PM2 runs dev server on port 3002, nginx proxies it to chosen external port
- **Nginx config template**:
  ```nginx
  # /etc/nginx/sites-available/<project-name>
  server {
    listen <external-port>;  # e.g., 3001, 8081, etc.
    server_name _;
    
    location / {
      proxy_pass http://localhost:3002;  # PM2 dev server
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
  ```
- **Enable**: `sudo ln -s /etc/nginx/sites-available/<project-name> /etc/nginx/sites-enabled/ && sudo systemctl reload nginx`
- **If declined**: Access directly via `http://localhost:3002` (PM2 port)

**Before starting, ask user if they want to enable optional features.**

## Common Project Types

**Quick reference for typical requests:**

- **Dashboard/Admin Panel** → Use `(dashboard)` route group, shadcn data tables, charts
- **Landing Page** → Single `app/page.tsx`, hero section, features grid, testimonials
- **Todo/Task App** → shadcn checkbox, input, button; local state or API
- **Blog/CMS** → Dynamic routes `app/blog/[slug]/page.tsx`, markdown support
- **E-commerce** → Product catalog, cart state (Zustand), checkout flow
- **SaaS App** → Auth (`(auth)` group), protected routes, subscription logic
- **Portfolio** → Projects grid, contact form, image gallery
- **Form-heavy App** → React Hook Form + Zod validation, shadcn form components

**Ask user:** What type of project are you building? (helps determine structure and components)

## Tech Stack

**Core:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS v3
- **shadcn/ui** (recommended UI component library)
- ESLint + Prettier

**API Integration (default):**
- axios (HTTP client)
- @tanstack/react-query (data fetching, caching, state management)

**Optional (based on needs):**
- Zustand (client-side state management)
- Zod (runtime validation)
- next-auth (authentication)
- Prisma (database ORM)

## Project Structure

**Industry-standard Next.js 14+ App Router structure with feature-based organization:**

```
<project-name>/
├── app/                                # Next.js 14 App Router
│   ├── (auth)/                         # Route group (auth pages)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx                  # Auth-specific layout
│   ├── (dashboard)/                    # Route group (protected pages)
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx                  # Dashboard layout with sidebar
│   ├── api/                            # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   └── users/
│   │       └── route.ts
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Home page
│   ├── loading.tsx                     # Root loading UI
│   ├── error.tsx                       # Root error boundary
│   ├── not-found.tsx                   # 404 page
│   └── providers.tsx                   # Client providers (React Query, etc.)
│
├── components/
│   ├── ui/                             # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/                         # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   ├── features/                       # Feature-specific components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   └── recent-activity.tsx
│   │   └── profile/
│   │       ├── profile-header.tsx
│   │       └── edit-profile-form.tsx
│   └── shared/                         # Shared/common components
│       ├── data-table.tsx
│       ├── search-bar.tsx
│       └── pagination.tsx
│
├── lib/                                # Utility functions & configurations
│   ├── api.ts                          # Axios instance + interceptors
│   ├── react-query.ts                  # React Query client config
│   ├── utils.ts                        # Utility functions (cn, formatters)
│   ├── validations.ts                  # Zod schemas
│   ├── constants.ts                    # App constants
│   └── auth.ts                         # Auth utilities (if using next-auth)
│
├── hooks/                              # Custom React hooks
│   ├── use-auth.ts                     # Authentication hook
│   ├── use-user.ts                     # User data hook (React Query)
│   ├── use-posts.ts                    # Posts data hook (React Query)
│   ├── use-media-query.ts              # Responsive design hook
│   └── use-toast.ts                    # Toast notifications (shadcn)
│
├── types/                              # TypeScript type definitions
│   ├── index.ts                        # Common types
│   ├── api.ts                          # API response types
│   ├── user.ts                         # User-related types
│   └── database.ts                     # Database types (Prisma generated)
│
├── actions/                            # Server Actions (Next.js 14+)
│   ├── auth.ts                         # Auth actions
│   ├── user.ts                         # User actions
│   └── posts.ts                        # Posts actions
│
├── config/                             # Configuration files
│   ├── site.ts                         # Site metadata (name, description, etc.)
│   └── navigation.ts                   # Navigation menu config
│
├── prisma/                             # Prisma ORM (if using database)
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Database migrations
│
├── public/                             # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                             # Global styles
│   └── globals.css                     # Tailwind imports + custom styles
│
├── .env.local                          # Environment variables (gitignored)
├── .env.example                        # Environment variables template
├── .eslintrc.json                      # ESLint config
├── .prettierrc                         # Prettier config
├── components.json                     # shadcn/ui config
├── next.config.js                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies
└── README.md                           # Project documentation
```

### Directory Purpose

**`app/`** - Next.js 14 App Router pages and layouts. Use route groups `(name)` for logical grouping without affecting URLs.

**`components/`** - All React components, organized by type:
- `ui/` - shadcn/ui components (copy-paste, customizable)
- `layout/` - Shared layout components (header, footer, sidebar)
- `features/` - Feature-specific components (scoped to one feature)
- `shared/` - Reusable components used across features

**`lib/`** - Utility functions, configurations, and third-party library setups.

**`hooks/`** - Custom React hooks, especially React Query hooks for API calls.

**`types/`** - TypeScript type definitions and interfaces.

**`actions/`** - Server Actions for form handling and server-side operations (Next.js 14+).

**`config/`** - App configuration (site metadata, navigation menus, constants).

**`prisma/`** - Database schema and migrations (if using Prisma).

**`public/`** - Static files served at root URL.

**`styles/`** - Global CSS (Tailwind imports + custom styles).

## Workflow

**Keep user informed at every step — this is a live build log.**

**⚠️ Important: All projects use PM2 for dev server management (port 3002 by default). This ensures:**
- Only one instance runs at a time (no port conflicts)
- Easy process management (list/logs/restart/stop)
- Persistent dev server across terminal sessions
- Better error logging and debugging

### Step 1: Project Setup
Ask:
- Project name
- Description/purpose
- Optional features (chromium review, nginx preview)

Create Next.js project:
```bash
npx create-next-app@latest <project-name> \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

**→ Message user: "Next.js project initialized ✓"**

### Step 2: Create Directory Structure

Create all necessary directories following industry best practices:

```bash
cd <project-name>

# Create app route groups
mkdir -p app/\(auth\)/login app/\(auth\)/register
mkdir -p app/\(dashboard\)/dashboard app/\(dashboard\)/profile app/\(dashboard\)/settings
mkdir -p app/api/auth app/api/users

# Create component directories
mkdir -p components/ui components/layout components/features components/shared
mkdir -p components/features/auth components/features/dashboard components/features/profile

# Create utility directories
mkdir -p lib hooks types actions config

# Create static asset directories
mkdir -p public/images public/icons public/fonts

# Create styles directory
mkdir styles

# Create Prisma directory (if using database)
# mkdir -p prisma
```

Create essential config files:

**`config/site.ts`** - Site metadata
```typescript
export const siteConfig = {
  name: '<Project Name>',
  description: '<Project Description>',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  links: {
    github: 'https://github.com/...',
  },
};
```

**`config/navigation.ts`** - Navigation menu
```typescript
export const mainNav = [
  { title: 'Home', href: '/' },
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Profile', href: '/profile' },
];

export const dashboardNav = [
  { title: 'Overview', href: '/dashboard' },
  { title: 'Profile', href: '/profile' },
  { title: 'Settings', href: '/settings' },
];
```

**`.env.example`** - Environment variables template
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

**→ Message user: "Directory structure created ✓"**

### Step 3: Install Dependencies

**Core dependencies:**
```bash
cd <project-name>
npm install axios @tanstack/react-query
npm install -D @types/node
```

**shadcn/ui setup (recommended):**
```bash
npx shadcn-ui@latest init
```

This will prompt for configuration. Recommended answers:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Install essential shadcn components:**
```bash
npx shadcn-ui@latest add button card input label select textarea
npx shadcn-ui@latest add dropdown-menu dialog sheet tabs
npx shadcn-ui@latest add table form avatar badge separator toast
```

**Install form dependencies (for shadcn/ui forms):**
```bash
npm install react-hook-form @hookform/resolvers zod
```

**Optional (ask user based on needs):**
```bash
npm install zustand  # State management
npm install next-auth  # Authentication
npm install prisma @prisma/client  # Database ORM
```

**→ Message user: "Dependencies + shadcn/ui installed ✓"**

### Step 4: Configure Base Files

#### `lib/api.ts` (axios instance)
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor (add auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

#### `lib/react-query.ts` (query client)
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

#### `app/providers.tsx` (wrap app with providers)
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Update `app/layout.tsx` to use Providers.

**→ Message user: "Base configuration complete ✓"**

### Step 5: Generate Features

Ask what features/pages to build. For each feature:

1. **Create route** (`app/<feature>/page.tsx`)
2. **Create components** (`components/features/<feature>/`)
3. **Create API hooks** (`hooks/use<Feature>.ts`) using react-query
4. **Create types** (`types/<feature>.ts`)
5. **Optionally create API routes** (`app/api/<feature>/route.ts`)

**Example: User Profile Feature**

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types/user';

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get<User>(`/users/${id}`);
      return data;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (user: Partial<User>) => {
      const { data } = await api.patch<User>(`/users/${user.id}`, user);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
};

// app/profile/[id]/page.tsx
'use client';

import { useUser, useUpdateUser } from '@/hooks/useUser';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: user, isLoading, error } = useUser(params.id);
  const updateUser = useUpdateUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
```

**→ Message user after each feature: "Profile page complete ✓"**

### Step 6: Build UI with shadcn/ui Components

Use shadcn/ui components (already installed) for consistent, accessible UI. Apply Design Principles (see below).

**Example: Profile page with shadcn/ui**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: user, isLoading } = useUser(params.id);

  if (isLoading) return <Card className="w-full max-w-2xl mx-auto"><CardContent>Loading...</CardContent></Card>;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button>Edit Profile</Button>
      </CardContent>
    </Card>
  );
}
```

**When to add more components:**
- Forms → `npx shadcn-ui@latest add form input label`
- Data tables → `npx shadcn-ui@latest add table`
- Navigation → `npx shadcn-ui@latest add navigation-menu`
- Feedback → `npx shadcn-ui@latest add toast alert`

**→ Message user: "UI built with shadcn/ui ✓"**

### Step 7: Visual Review (if chromium enabled)

**Important:** Use PM2 to manage the dev server (ensures only 1 instance runs, prevents port conflicts).

Start dev server with PM2:
```bash
# Stop any existing instance of this project
pm2 delete <project-name> 2>/dev/null || true

# Start with PM2 (port 3002 for nginx proxy)
PORT=3002 pm2 start npm --name "<project-name>" --cwd "$(pwd)" -- run dev

# Give PM2 a moment to start
sleep 2
```

**Wait for server to be fully ready** (critical - avoid white screen screenshots):
```bash
# Wait for "Ready in" message in PM2 logs (usually 5-15 seconds)
timeout=30
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if pm2 logs <project-name> --nostream --lines 50 2>/dev/null | grep -q "Ready in"; then
    echo "Server ready!"
    sleep 3  # Extra buffer for module loading
    break
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

# Verify server is responding
if ! curl -s http://localhost:3002 > /dev/null; then
  echo "Warning: Server not responding on port 3002"
  pm2 logs <project-name> --nostream --lines 20
fi
```

Take screenshots (requires chromium):
```bash
bash scripts/screenshot.sh "http://localhost:3002" /tmp/review-desktop.png 1400 900
bash scripts/screenshot.sh "http://localhost:3002" /tmp/review-mobile.png 390 844
```

**Review Checklist** (analyze with `image` tool):
- ✅ **Desktop (1400px)**: Content centered, proper spacing
- ✅ **Mobile (390px)**: 
  - No horizontal overflow (content fits within screen)
  - Text readable (not too small)
  - Padding appropriate (p-4 not p-24)
  - Touch targets large enough (min 44x44px)
  - No content cutting off edges

**If issues found:** Fix responsive classes, re-run screenshots.

Common fixes:
- Large padding → `p-4 md:p-8 lg:p-12`
- Large text → `text-2xl md:text-4xl`
- Wide content → Add `max-w-full` or `px-4`

**→ Message user: "Review complete, sending preview..."**

### Step 8: Environment Setup

Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

Create `.env.example` (template for user).

**→ Message user: "Environment template created ✓"**

### Step 9: Scripts & Documentation

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

Create `README.md` with:
- Setup instructions
- Environment variables needed
- Development commands
- API integration guide

**→ Message user: "Documentation complete ✓"**

### Step 10: Export & Deploy Guidance

**Stop PM2 dev server** (if running):
```bash
pm2 delete <project-name> 2>/dev/null || true
pm2 save  # Persist PM2 process list
```

Zip the project:
```bash
cd .. && zip -r /tmp/<project-name>.zip <project-name>/
```

Send via message tool with `filePath`.

Provide deployment options:
- **Vercel** (recommended): `npx vercel`
- **Netlify**: `npm run build && netlify deploy`
- **Docker**: Provide Dockerfile
- **Self-hosted**: Provide systemd service + nginx config

**→ Message user: "Project ready! 🚀"**

## Testing & Live Preview

### Quick Test (during development)

**1. PM2 dev server (always running after Step 7):**
```bash
# Check status
pm2 list

# View logs
pm2 logs <project-name>

# Access locally
curl http://localhost:3002
```

**2. Live preview URLs:**
- **Local access:** `http://localhost:3002`
- **Nginx proxy** (if configured): `http://<server-ip>:<external-port>`
- **Mobile testing:** Use nginx proxy or ngrok/tunneling service

**3. Screenshot review (if chromium enabled):**
```bash
# Desktop (1400x900)
bash scripts/screenshot.sh "http://localhost:3002" /tmp/desktop.png 1400 900

# Mobile (390x844)
bash scripts/screenshot.sh "http://localhost:3002" /tmp/mobile.png 390 844
```

### End-to-End Testing Workflow

**Full test sequence:**
```bash
# 1. Check PM2 status
pm2 list | grep <project-name>

# 2. Verify dev server responding
curl -I http://localhost:3002

# 3. Take screenshots for visual verification
bash scripts/screenshot.sh "http://localhost:3002" /tmp/test-desktop.png 1400 900
bash scripts/screenshot.sh "http://localhost:3002" /tmp/test-mobile.png 390 844

# 4. Check logs for errors
pm2 logs <project-name> --lines 50 | grep -i error

# 5. Test API endpoints (if using API routes)
curl http://localhost:3002/api/health  # Example health check

# 6. Production build test
npm run build && npm run start  # Test production build

# 7. Type check
npm run type-check
```

### Common Testing Scenarios

**Scenario 1: Test responsive design**
```bash
# Mobile, tablet, desktop
for width in 390 768 1400; do
  bash scripts/screenshot.sh "http://localhost:3002" /tmp/screen-${width}.png $width 900
done
```

**Scenario 2: Test specific page/route**
```bash
# Take screenshot of specific route
bash scripts/screenshot.sh "http://localhost:3002/dashboard" /tmp/dashboard.png 1400 900
```

**Scenario 3: Test after making changes**
```bash
# PM2 auto-reloads on file changes, verify in logs
pm2 logs <project-name> --lines 20

# Wait for "compiled successfully" then take new screenshot
bash scripts/screenshot.sh "http://localhost:3002" /tmp/updated.png 1400 900
```

### Sharing Preview with User

**Option 1: Screenshots**
- Send desktop + mobile screenshots via message tool
- User provides feedback, you iterate

**Option 2: Nginx proxy + external access**
- Set up nginx config (see Optional Features)
- Share URL: `http://<server-ip>:<port>`
- User can test live in browser

**Option 3: Export & deploy**
- Zip project and send to user
- User deploys to Vercel/Netlify
- Test on production URL

## API Integration Patterns

### Pattern 1: REST API (default)

Use axios + react-query:

```typescript
// hooks/usePosts.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data } = await api.get('/posts');
      return data;
    },
  });
};

export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (post: { title: string; body: string }) => {
      const { data } = await api.post('/posts', post);
      return data;
    },
  });
};
```

### Pattern 2: GraphQL (optional)

Install:
```bash
npm install @apollo/client graphql
```

Setup Apollo Client, use `useQuery` and `useMutation` from Apollo.

### Pattern 3: tRPC (optional)

For Next.js API routes with type safety:
```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
```

### Pattern 4: Server Actions (Next.js 14+)

For form handling without API routes:
```typescript
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  // ...
}
```

**Always ask user which pattern they prefer for their use case.**

## Design Principles

Apply these consistently. These are quality standards.

### Layout & Spacing
- Consistent Tailwind spacing scale (4, 6, 8, 12, 16, 20, 24)
- Max content width: max-w-5xl or max-w-6xl
- Vertical rhythm: py-16 for sections, py-8 for subsections
- Mobile: minimum px-4 padding

### Typography
- Clear hierarchy (h1 → h2 → h3, max 3-4 sizes)
- Line length: max 65-75 characters (max-w-prose)
- Font weight contrast (bold headings, regular body)
- Text color hierarchy (slate-900 → slate-700 → slate-500)

### Color & Contrast
- WCAG AA minimum (4.5:1 contrast)
- Limit palette (1 primary + 1 accent + neutrals)
- Consistent accent usage (CTAs, links, active states)

### Responsive Design (Critical)
- **Mobile-first** (390px → 768px → 1024px) - Always design for 390px first
- **Responsive padding** - Use Tailwind responsive classes:
  - Mobile: `p-4` or `px-4 py-6` (never p-24 on mobile!)
  - Tablet: `md:p-8` or `md:px-6 md:py-8`
  - Desktop: `lg:p-12 xl:p-24`
  - Example: `<main className="p-4 md:p-8 lg:p-12">`
- **Responsive text sizes** - Scale down headings on mobile:
  - Mobile: `text-2xl` → Desktop: `md:text-4xl`
  - Mobile: `text-lg` → Desktop: `md:text-2xl`
- **No horizontal overflow** - Content must fit within 390px width
  - Test: Check mobile screenshot for any content cutting off edges
  - Use `max-w-full` on containers
  - Break long words: `break-words`
- **Touch targets** - min 44x44px for buttons/links on mobile
- **Stack on mobile** - Grids collapse to single column: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Hamburger menu** - Required on mobile for navigation

### Components (Use shadcn/ui)
- **Icons**: Use Lucide React (comes with shadcn/ui), never emoji
- **Buttons**: Use `<Button>` component with variants (default, destructive, outline, ghost)
- **Forms**: Use shadcn `<Form>` with react-hook-form integration
- **Cards**: Use `<Card>` component for content sections
- **Dialogs/Modals**: Use `<Dialog>` or `<Sheet>` components
- **Loading states**: Use shadcn `<Skeleton>` component for loading UI
- **Error handling**: Use `<Alert>` component for error messages
- **Data display**: Use `<Table>` component for tabular data

**shadcn/ui benefits:** Accessible, customizable, copy-paste friendly, works with Tailwind

### TypeScript Best Practices
- Strict mode enabled
- Explicit return types for functions
- Interface over type for objects
- Avoid `any` (use `unknown` if needed)
- Use discriminated unions for variants

### Performance
- Use Next.js Image component (`next/image`)
- Lazy load below-the-fold content
- Code splitting (dynamic imports)
- Memoize expensive computations (useMemo, useCallback)

## Common Patterns

### Form Handling (with shadcn/ui)
```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export default function ContactForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await api.post('/contact', data);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Message sent!' });
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Form>
  );
}
```

**Note:** Run `npx shadcn-ui@latest add form toast` and install `npm install react-hook-form @hookform/resolvers zod` for this pattern.

### Pagination
```typescript
const usePaginatedPosts = (page: number) => {
  return useQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      const { data } = await api.get(`/posts?page=${page}`);
      return data;
    },
    keepPreviousData: true, // Smooth transitions
  });
};
```

### Infinite Scroll
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const useInfinitePosts = () => {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/posts?page=${pageParam}`);
      return data;
    },
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
  });
};
```

## Common Mistakes to Avoid
- ❌ Not wrapping app with QueryClientProvider
- ❌ Using axios without interceptors (no error handling)
- ❌ Forgetting loading/error states in components
- ❌ Not invalidating queries after mutations
- ❌ Using `any` instead of proper TypeScript types
- ❌ Client components when server components would work
- ❌ Not using Next.js Image component (performance loss)
- ❌ Missing error boundaries
- ❌ Hardcoding API URLs (use env vars)
- ❌ No mobile testing (always check responsive at 390px width)
- ❌ **Large padding on mobile** (p-24 = 96px causes overflow on 390px screens)
- ❌ **Not using responsive Tailwind classes** (use p-4 md:p-8 lg:p-12)
- ❌ **Horizontal overflow on mobile** (content wider than 390px)
- ❌ Building custom components when shadcn/ui has them (Button, Card, Dialog, etc.)
- ❌ Using emoji for icons (use Lucide React icons from shadcn/ui)
- ❌ Not installing `@hookform/resolvers` and `zod` before using shadcn forms
- ❌ Forgetting to add `<Toaster />` component when using toast notifications
- ❌ **Taking screenshots before dev server is fully ready** (causes white screens)
- ❌ **Not waiting for module loading** (causes "Module not found" errors in screenshots)

## Troubleshooting

### White Screen Screenshots
**Problem:** Screenshots show blank white page
**Cause:** Dev server not fully initialized before screenshot
**Solution:** 
- Wait for "Ready in" message in dev server logs
- Add 3-5 second buffer after "Ready" message
- Verify localhost:3000 loads in browser before taking screenshot

### Module Not Found Errors
**Problem:** React error "Module not found: Can't resolve @tanstack/react-query"
**Cause:** Dev server started before all packages loaded
**Solution:**
- Restart dev server: `pkill -f "next dev" && npm run dev`
- Verify packages in node_modules: `ls node_modules/@tanstack/`
- Wait 10-15 seconds after `npm install` before starting dev server

### Dev Server Won't Start
**Problem:** Port already in use (EADDRINUSE error)
**Solution (PM2 method):**
```bash
# Check what's running
pm2 list

# Stop the conflicting process
pm2 delete <project-name>

# Or check port directly
lsof -ti:3002

# Kill process on port (if not PM2-managed)
kill -9 $(lsof -ti:3002)

# Restart with PM2
PORT=3002 pm2 start npm --name "<project-name>" --cwd "$(pwd)" -- run dev
```

### PM2 Process Management
**List all PM2 processes:**
```bash
pm2 list
```

**Check logs:**
```bash
pm2 logs <project-name> --lines 50
```

**Restart a process:**
```bash
pm2 restart <project-name>
```

**Stop a process:**
```bash
pm2 stop <project-name>
```

**Delete a process:**
```bash
pm2 delete <project-name>
```

**Ensure only one instance runs:**
```bash
# Always delete before starting
pm2 delete <project-name> 2>/dev/null || true
PORT=3002 pm2 start npm --name "<project-name>" --cwd "$(pwd)" -- run dev
```

**Common PM2 scenarios:**

1. **Project won't start** → Check logs: `pm2 logs <project-name>`
2. **Process keeps restarting** → Module missing or port conflict, check logs
3. **Changes not reflecting** → PM2 auto-reloads, verify in logs: `pm2 logs <project-name> | grep compiled`
4. **Multiple instances running** → Delete all: `pm2 delete all && pm2 list`
5. **Check resource usage** → `pm2 monit` (real-time monitoring)
6. **Save PM2 process list** → `pm2 save` (persists across reboots)

## Iteration & Updates

When user requests changes:
1. Identify affected files
2. Make changes
3. **PM2 auto-reloads** (no manual restart needed for file changes)
4. Run type check: `npm run type-check`
5. Verify in logs: `pm2 logs <project-name> --lines 20`
6. If chromium enabled: take new screenshot
7. Report changes to user

**Always explain what changed and why.**

---

## Quick Reference Cheat Sheet

### Essential Commands
```bash
# Start dev server
pm2 delete <project-name> 2>/dev/null || true
PORT=3002 pm2 start npm --name "<project-name>" --cwd "$(pwd)" -- run dev

# Check status
pm2 list
pm2 logs <project-name>

# Take screenshots
bash scripts/screenshot.sh "http://localhost:3002" /tmp/desktop.png 1400 900
bash scripts/screenshot.sh "http://localhost:3002" /tmp/mobile.png 390 844

# Test production build
npm run build && npm run start

# Type check
npm run type-check
```

### File Locations
- **Components:** `components/ui/` (shadcn), `components/features/` (custom)
- **Pages:** `app/*/page.tsx`
- **API routes:** `app/api/*/route.ts`
- **Styles:** `app/globals.css`, `tailwind.config.ts`
- **Config:** `next.config.ts`, `.env.local`

### Common shadcn Components
```bash
npx shadcn-ui@latest add button input form card table dialog toast
```

### Live Preview URLs
- **Local:** http://localhost:3002
- **Nginx proxy:** http://<server-ip>:<external-port>
- **Mobile testing:** Use nginx proxy or ngrok

### Troubleshooting
1. **Port conflict** → `pm2 delete <name>` then restart
2. **White screen** → Wait for "Ready in" message (check logs)
3. **Module errors** → `npm install` then restart PM2
4. **Type errors** → `npm run type-check`
5. **Layout breaks** → Check responsive classes (p-4 md:p-8 lg:p-12)
