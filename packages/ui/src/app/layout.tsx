import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toast'
import { AuthProvider } from '@/hooks/use-auth'
import { AuthGuard } from '@/components/auth/auth-guard'
import { I18nProvider } from '@/providers/i18n-provider'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'RondoFlow',
  description: 'Visual orchestration platform for Claude Code agents',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, 'font-sans antialiased')}>
        <I18nProvider>
          <AuthProvider>
            <AuthGuard>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </AuthGuard>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
