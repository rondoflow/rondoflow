import type { Metadata } from 'next'
import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { Proof } from '@/components/landing/proof'
import { BuiltWith } from '@/components/landing/built-with'
import { Capabilities } from '@/components/landing/capabilities'
import { VersusTerminal } from '@/components/landing/versus-terminal'
import { UseCases } from '@/components/landing/use-cases'
import { Install } from '@/components/landing/install'
import { Screenshots } from '@/components/landing/screenshots'
import { CatalogOverview } from '@/components/landing/catalog-overview'
import { Features } from '@/components/landing/features'
import { CompareTeaser } from '@/components/landing/compare-teaser'
import { Faq } from '@/components/landing/faq'
import { OpenSource } from '@/components/landing/open-source'
import { SiteFooter } from '@/components/landing/site-footer'
import { JsonLd } from '@/components/landing/json-ld'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Proof />
        <BuiltWith />
        <Capabilities />
        <VersusTerminal />
        <UseCases />
        <Install />
        <Screenshots />
        <CatalogOverview />
        <Features />
        <CompareTeaser />
        <Faq />
        <OpenSource />
      </main>
      <SiteFooter />
      <JsonLd />
    </>
  )
}
