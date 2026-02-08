import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ExpandableCard } from "@/components/ui/expandable-card";

const caseStudies = [
  {
    title: "E-commerce Platform",
    description: "Product & Engineering",
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    content: (
      <>
        <p>
          Led design and development of a modern e-commerce platform with
          real-time inventory and checkout. Stack: Next.js, Stripe, Postgres.
        </p>
        <p>Outcomes: 40% faster checkout, 25% higher conversion.</p>
      </>
    ),
  },
  {
    title: "Fashion Brand Experience",
    description: "Brand & Web",
    src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    content: (
      <>
        <p>
          End-to-end digital experience for a fashion brand: campaign site,
          lookbook, and integrated shop. Focus on performance and visual
          storytelling.
        </p>
        <p>Outcomes: 2x engagement, 30% lower bounce on mobile.</p>
      </>
    ),
  },
  {
    title: "Serrum Product Launch",
    description: "Product & Marketing",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    content: (
      <>
        <p>
          Product launch site and marketing funnel for Serrum: landing pages,
          waitlist, and email flows. Clean UI and clear CTAs.
        </p>
        <p>Outcomes: 5k+ signups in first month, 12% email open rate.</p>
      </>
    ),
  },
];

export default function ProjectPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-designBg">
      <Header />
      <section className="w-full m-0 py-12 md:py-16 lg:py-20 px-6 md:px-[5%]">
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-2">
          Case Studies
        </h1>
        <p className="text-[var(--color-text)]/80 mb-10 max-w-xl">
          Selected projects across product, brand, and marketing.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
          {caseStudies.map((study) => (
            <ExpandableCard
              key={study.title}
              title={study.title}
              description={study.description}
              src={study.src}
            >
              {study.content}
            </ExpandableCard>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
