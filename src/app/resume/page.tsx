import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ResumeTimeline from "@/components/sections/ResumeTimeline";

export default function ResumePage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <ResumeTimeline />
      <Footer />
    </main>
  );
}
