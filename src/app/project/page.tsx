import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CaseStudiesGrid from "@/components/sections/CaseStudiesGrid";
import { caseStudies } from "@/data/caseStudies";

const featuredSlugs = [
  "ecommerce-platform",
  "fashion-brand-experience",
  "serrum-product-launch",
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
