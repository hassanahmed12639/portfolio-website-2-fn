export const dynamic = 'force-dynamic'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CaseStudiesGrid from "@/components/sections/CaseStudiesGrid";
import { getPortfolioProjects } from "@/lib/portfolio-projects";

export default async function ProjectPage() {
  const featured = await getPortfolioProjects();

  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <CaseStudiesGrid studies={featured} />
      <Footer />
    </main>
  );
}
