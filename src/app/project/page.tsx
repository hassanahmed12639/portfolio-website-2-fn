export const dynamic = 'force-dynamic'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CaseStudiesGrid from "@/components/sections/CaseStudiesGrid";
import { caseStudies } from "@/data/caseStudies";

const featuredSlugs = [
  "vegout-organics",
  "little-laser-clinic",
  "comporta-experience",
  "trade-locks",
  "driveucars",
  "rcc-custom-landscapes",
  "mala-yachts",
  "steve-apparel",
  "alliance-shipping",
];

export default function ProjectPage() {
  const featured = caseStudies.filter((s) => featuredSlugs.includes(s.slug));

  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <CaseStudiesGrid studies={featured} />
      <Footer />
    </main>
  );
}
