'use client'

import Link from 'next/link'
import Image from 'next/image'

const BLUE = 'rgb(37, 99, 235)'

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
    <section className="py-24 overflow-hidden" style={{ backgroundColor: BLUE }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-white mb-4">{title}</h2>
          <p className="text-lg text-blue-200 mb-8">{description}</p>
          <Link
            href="/dashboard/signup"
            className="inline-block bg-white font-bold px-10 py-4 rounded-xl text-lg transition-colors hover:bg-blue-50 w-fit mx-auto md:mx-0"
            style={{ color: BLUE }}
          >
            {buttonText}
          </Link>
        </div>

        <div className="hidden md:flex flex-1 relative min-w-0 md:min-w-[380px] min-h-[320px] items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-[584/750]">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 768px) 0vw, 420px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
