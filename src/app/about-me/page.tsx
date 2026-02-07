import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TestimonialCarousel } from "@/components/sections/TestimonialCarousel";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-24 sm:pt-32 pb-16 md:pb-24">
        <TestimonialCarousel />
      </section>
      <Footer />
    </main>
  );
}
