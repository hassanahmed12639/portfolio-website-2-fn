export const dynamic = 'force-dynamic'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BudgetReverseCalculator from '@/components/BudgetReverseCalculator'

export default function BudgetReverseCalculatorPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <section className="w-full m-0 pt-14 lg:pt-6">
        <BudgetReverseCalculator />
      </section>
      <Footer />
    </main>
  )
}
