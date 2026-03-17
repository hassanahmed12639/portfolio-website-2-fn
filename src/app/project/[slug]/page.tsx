export const dynamic = 'force-dynamic'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShareArticleLinks from "@/components/ShareArticleLinks";
import CaseStudyTOC from "@/components/CaseStudyTOC";
import SummarizeInChatGPT from "@/components/SummarizeInChatGPT";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioProjectBySlug, getPortfolioProjects } from "@/lib/portfolio-projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getPortfolioProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const study = await getPortfolioProjectBySlug(slug);
  if (!study) return { title: "Case Study" };
  return {
    title: `${study.title} | Projects`,
    description: study.description,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getPortfolioProjectBySlug(slug);
  if (!study) notFound();

  const sections = study.sections ?? [];
  const takeaways = study.keyTakeaways ?? [];
  const tocItems = [
    ...(takeaways.length > 0 ? [{ id: "key-takeaways", label: "Key Takeaways" }] : []),
    ...sections.map((s) => ({ id: s.id, label: s.heading })),
  ];

  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <section className="w-full m-0 py-8 md:py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* Sidebar: TOC, Share, CTA (left on desktop) */}
          <aside className="order-2 lg:order-1 lg:sticky lg:top-24 self-start space-y-8">
            <CaseStudyTOC items={tocItems} />
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                Share this article
              </h2>
              <ShareArticleLinks title={study.title} />
            </div>
            <div className="p-4 rounded-lg border border-[var(--color-text)]/10 bg-[var(--color-bg)]">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] mb-3 text-xl font-bold">
                %
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">See more in action</h3>
              <p className="text-base text-[var(--color-text)]/70 mb-4">
                Explore other case studies and project outcomes.
              </p>
              <Link
                href="/project"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-md font-medium text-sm bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
              >
                View all case studies
              </Link>
            </div>
          </aside>

          {/* Main content: hero first, then breadcrumb, title, meta, author, body */}
          <article className="flex flex-col text-[var(--color-text)] text-[21px] order-1 lg:order-2 min-w-0">
            {/* Hero: full-width image */}
            <div id="hero" className="mb-8 md:mb-12">
              <div className="relative min-h-[220px] md:min-h-[280px] rounded-2xl overflow-hidden">
                <Image
                  src={study.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>

            {/* Breadcrumb */}
            <nav className="mb-4" aria-label="Breadcrumb">
              <Link href="/" className="text-[var(--color-accent)] hover:underline underline-offset-2">HOME</Link>
              <span className="mx-2 text-[var(--color-text)]/50">/</span>
              <Link href="/project" className="text-[var(--color-accent)] hover:underline underline-offset-2">PROJECTS</Link>
              <span className="mx-2 text-[var(--color-text)]/50">/</span>
              <span className="text-[var(--color-text)]">{study.author.toUpperCase()}</span>
            </nav>

            {/* Large heading */}
            <h1 className="text-[48px] font-bold text-[var(--color-text)] mb-6 leading-tight">
              {study.title}
            </h1>

            {/* Metadata row: Published, read time, Summarize in ChatGPT */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--color-text)]/70 mb-6">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Published: {study.date}
              </span>
              {study.readTime && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {study.readTime}
                </span>
              )}
              <SummarizeInChatGPT
                title={study.title}
                description={study.description}
                sections={sections}
                slug={slug}
              />
            </div>

            {/* Author block: avatar, name + badge, title + caret */}
            <div className="flex items-center gap-3 mb-10 pb-8 border-b border-[var(--color-text)]/10">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] font-semibold shrink-0">
                {study.author.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-text)] flex items-center gap-1.5">
                  {study.author}
                  <span className="text-[var(--color-accent)]" aria-hidden>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                </p>
                <p className="text-[var(--color-text)]/70 flex items-center gap-1">
                  {study.authorTitle ?? "Case Study"}
                  <span className="text-[var(--color-text)]/50" aria-hidden>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                  </span>
                </p>
              </div>
            </div>

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <div id="key-takeaways" className="mb-10 scroll-mt-24">
                <h2 className="font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">◆</span> Key Takeaways
                </h2>
                <p className="text-[var(--color-text)]/90 leading-relaxed mb-4">
                  {study.description}
                </p>
                <ul className="space-y-2">
                  {takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)] mt-0.5">•</span>
                      <span className="text-[var(--color-text)]/90">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content images (below Key Takeaways when present) */}
            {study.contentImages && study.contentImages.length > 0 && (
              <div className="mb-10 space-y-6">
                {study.contentImages.map((img, i) => (
                  <div key={i} className="w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt ?? ""}
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                ))}
              </div>
            )}
            {study.contentImage && !study.contentImages && (
              <div className="mb-10 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={study.contentImage.src}
                  alt={study.contentImage.alt ?? ""}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            )}

            {/* Sections */}
            {sections.map((sec) => (
              <div key={sec.id}>
                <div id={sec.id} className="mb-10 scroll-mt-24">
                  <h2 className="font-semibold text-[var(--color-text)] mb-4">
                    {sec.heading}
                  </h2>
                  <p className="text-[var(--color-text)]/90 leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <p className="text-[var(--color-text)]/90 leading-relaxed">
                {study.description}
              </p>
            )}

            <div className="mt-12 pt-8 border-t border-[var(--color-text)]/10">
              <Link
                href="/project"
                className="inline-flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline underline-offset-2"
              >
                ← Back to all case studies
              </Link>
            </div>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
