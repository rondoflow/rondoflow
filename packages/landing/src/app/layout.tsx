import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { SITE } from '@/lib/site'
import { ScrollFx } from '@/components/landing/scroll-fx'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  weight: '100 900',
  display: 'swap',
})

const DESCRIPTION =
  'RondoFlow is a local-first, open-source visual canvas for orchestrating Claude Code agents. Drag agents onto a board, wire them into workflows, and run multi-agent pipelines on your own machine.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'RondoFlow - Visual orchestration for Claude Code agents',
    template: '%s - RondoFlow',
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  authors: [{ name: 'RondoFlow Contributors', url: SITE.github }],
  creator: 'RondoFlow',
  publisher: SITE.name,
  category: 'technology',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'RondoFlow - Visual orchestration for Claude Code agents',
    description:
      'A local-first, open-source canvas for orchestrating Claude Code agents. Wire agents into workflows and run them on your own machine.',
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'RondoFlow visual canvas for orchestrating Claude Code agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RondoFlow - Visual orchestration for Claude Code agents',
    description:
      'Open-source, local-first canvas for orchestrating Claude Code agents into multi-agent workflows.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '1024x1024' },
    ],
    apple: [{ url: '/favicon.png', sizes: '1024x1024' }],
  },
}

// Dark is the default theme, so the SSR theme-color is dark (--paper in .dark).
// The boot script and the toggle keep this meta in sync with the active theme,
// so the browser chrome adapts to the actual page, not the OS preference.
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#0a0a0a',
}

// Runs before paint: applies the theme and arms scroll-reveal only when motion
// is allowed - so there's no theme flash and no JS-hidden content. Dark is the
// default: the page goes dark unless the visitor explicitly saved 'light'.
const BOOT_SCRIPT = `(function(){try{var d=document.documentElement,dark=localStorage.getItem('rf-theme')!=='light';if(dark)d.classList.add('dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',dark?'#0a0a0a':'#ffffff');if(matchMedia('(prefers-reduced-motion: no-preference)').matches)d.classList.add('reveal-ready');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Privacy-friendly analytics beacon (loaded on every page). */}
        <script
          defer
          data-domain="rondoflow.app"
          src="https://beacon.static-data.com/js/script.js"
        />
      </head>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {children}
        <ScrollFx />
      </body>
    </html>
  )
}
