import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TestimonialCarousel } from "@/components/sections/TestimonialCarousel";

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <section className="w-full m-0 py-12 md:py-16 lg:py-20 px-6 md:px-[5%]">
        <TestimonialCarousel />
      </section>
      <Footer />
    </main>
  );
}
