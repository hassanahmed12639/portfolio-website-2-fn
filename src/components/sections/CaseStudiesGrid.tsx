'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { CaseStudy } from '@/data/caseStudies'

const DESCRIPTION_MAX = 140

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const truncated =
    study.description.length > DESCRIPTION_MAX
      ? study.description.slice(0, DESCRIPTION_MAX).trim() + '...'
      : study.description

  const initial = study.author.slice(0, 1).toUpperCase()

  return (
    <Link
      href={`/project/${study.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-card text-card-foreground border border-border shadow-sm transition-shadow hover:shadow-md dark:shadow-none dark:border-border/80"
    >
      <h2 className="text-base md:text-lg font-bold pt-6 px-6 pb-5 text-foreground leading-tight">
        {study.title}
      </h2>
      <div className="relative w-full aspect-[4/3] flex-shrink-0 overflow-hidden bg-muted rounded-t-none">
        <Image
          src={study.src}
          alt={study.title}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>
      <div className="flex items-center gap-2 pt-5 px-6 pb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium bg-muted text-muted-foreground flex-shrink-0"
          aria-hidden
        >
          {initial}
        </div>
        <span className="text-sm text-muted-foreground">
          by{' '}
          <span className="text-foreground font-bold group-hover:text-[#AAFF00] dark:group-hover:text-[#AAFF00] transition-colors">
            {study.author}
          </span>
          {study.authorTitle && (
            <span className="ml-1.5 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              PRO
            </span>
          )}
        </span>
      </div>
      <p className="text-sm text-muted-foreground px-6 pt-0 pb-6 line-clamp-3">
        {truncated}
      </p>
    </Link>
  )
}

export default function CaseStudiesGrid({ studies }: { studies: CaseStudy[] }) {
  return (
    <section className="w-full m-0 py-14 md:py-20 lg:py-24 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-3">
          Case Studies
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-xl">
          Selected projects across product, brand, and marketing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
          {studies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </div>
      </div>
    </section>
  )
}
