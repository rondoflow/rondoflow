import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import localFont from 'next/font/local'
import 'nextra-theme-docs/style.css'
import './docs-theme.css'

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

export const metadata = {
  title: {
    default: 'RondoFlow Docs',
    template: '%s – RondoFlow Docs',
  },
  description:
    'Guides and technical reference for RondoFlow — a local-first visual orchestration platform for Claude Code agents.',
}

const navbar = (
  <Navbar
    logo={
      <span className="rf-logo">
        <span className="rf-logo-mark">O</span>
        <span className="rf-logo-text">RondoFlow</span>
      </span>
    }
    projectLink="https://github.com/rondoflow/rondoflow"
  >
    <a href="https://rondoflow.app" className="rf-home-link">
      ← rondoflow.app
    </a>
  </Navbar>
)

const footer = <Footer>MIT © RondoFlow — local-first orchestration for Claude Code agents.</Footer>

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()

  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/rondoflow/rondoflow/tree/master/packages/docs"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          nextThemes={{ defaultTheme: 'dark' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
