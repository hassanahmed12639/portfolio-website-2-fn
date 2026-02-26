import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CustomAudienceBuilder from '@/components/CustomAudienceBuilder'

export default function CustomAudienceBuilderPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <section className="w-full m-0 pt-14 lg:pt-6">
        <CustomAudienceBuilder />
      </section>
      <Footer />
    </main>
  )
}
