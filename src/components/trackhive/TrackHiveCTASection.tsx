'use client'

import { CtaCard } from '@/components/ui/cta-card'

interface TrackHiveCTASectionProps {
  title?: string
  description?: string
  buttonText?: string
  imageSrc?: string
}

export function TrackHiveCTASection({
  title = 'Ready to connect your stack?',
  description = 'Get started in 5 minutes. No credit card required.',
  buttonText = 'Start for free →',
  imageSrc = '/side-image.png',
}: TrackHiveCTASectionProps) {
  return (
    <section className="py-24 overflow-hidden bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <CtaCard
          imageSrc={imageSrc}
          title={title}
          description={description}
          buttonText={buttonText}
        />
      </div>
    </section>
  )
}
