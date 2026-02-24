import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import UTMBuilder from '@/components/UTMBuilder'

export default function UTMBuilderPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <section className="w-full m-0 pt-14 lg:pt-6">
        <UTMBuilder />
      </section>
      <Footer />
    </main>
  )
}
