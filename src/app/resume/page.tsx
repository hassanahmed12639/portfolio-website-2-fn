export const dynamic = 'force-dynamic'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResumeTimeline from "@/components/sections/ResumeTimeline";
import { getPortfolioResumeSettings } from "@/lib/portfolio-settings";

export default async function ResumePage() {
  const settings = await getPortfolioResumeSettings();

  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <ResumeTimeline settings={settings} />
      <Footer />
    </main>
  );
}
