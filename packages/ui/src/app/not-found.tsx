'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation('app')
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background text-center">
      <p className="font-mono text-4xl font-bold text-foreground/20">{t('notFound.code')}</p>
      <h1 className="text-lg font-semibold">{t('notFound.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('notFound.description')}
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t('notFound.back')}
      </Link>
    </div>
  )
}
