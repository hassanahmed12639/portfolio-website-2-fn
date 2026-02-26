'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { CaseStudy } from '@/data/caseStudies'

const DESCRIPTION_MAX = 120

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const truncated =
    study.description.length > DESCRIPTION_MAX
      ? study.description.slice(0, DESCRIPTION_MAX).trim() + '...'
      : study.description

  const initial = study.author.slice(0, 1).toUpperCase()

  return (
    <Link
      href={`/project/${study.slug}`}
      className="group flex flex-col rounded-2xl bg-card text-card-foreground overflow-hidden shadow-sm transition-shadow hover:shadow-md dark:shadow-none"
    >
      <div className="text-sm text-muted-foreground pt-6 px-6 pb-1">
        {study.date}
      </div>
      <h2 className="text-2xl font-semibold px-6 pb-4 text-foreground">
        {study.title}
      </h2>
      <div className="relative w-full aspect-[4/3] flex-shrink-0 overflow-hidden bg-muted">
        <Image
          src={study.src}
          alt={study.title}
          fill
          className="object-cover transition-transform group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex items-center gap-2 pt-5 px-6 pb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium bg-muted text-muted-foreground flex-shrink-0"
          aria-hidden
        >
          {initial}
        </div>
        <span className="text-base text-muted-foreground">
          by{' '}
          <span className="text-foreground font-medium group-hover:text-black dark:group-hover:text-[#AAFF00] transition-colors">
            {study.author}
          </span>
          {study.authorTitle && (
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground font-medium">
              PRO
            </span>
          )}
        </span>
      </div>
      <p className="text-base text-muted-foreground px-6 pt-1 line-clamp-3 flex-1">
        {truncated}
      </p>
      <span className="inline-flex items-center gap-1 text-foreground font-medium px-6 pb-6 pt-2 text-sm group-hover:text-black dark:group-hover:text-[#AAFF00] transition-colors">
        <span aria-hidden>→</span> Read Article
      </span>
    </Link>
  )
}

export default function CaseStudiesGrid({
  studies,
}: {
  studies: CaseStudy[]
}) {
  return (
    <section className="w-full m-0 py-14 md:py-20 lg:py-24 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-3">
          Case Studies
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-xl">
          Selected projects across product, brand, and marketing.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {studies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </div>
      </div>
    </section>
  )
}
