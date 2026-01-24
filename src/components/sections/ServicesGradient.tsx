'use client'

import { useRef, useCallback } from 'react'

interface ServiceCard {
  icon: React.ReactNode
  title: string
  description: string
}

const services: ServiceCard[] = [
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2v2" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Social Media Growth',
    description: 'Strategic social media management that builds engaged communities and drives brand awareness across all major platforms.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20V10" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 20V4" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20v-4" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="6" r="2" stroke="url(#grad2)" strokeWidth="2"/>
        <circle cx="6" cy="12" r="2" stroke="url(#grad2)" strokeWidth="2"/>
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'PPC & Paid Ads',
    description: 'Data-driven paid advertising campaigns on Google, Meta, and LinkedIn that maximize ROI and drive qualified leads.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="22,6 12,13 2,6" stroke="url(#grad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Email Marketing',
    description: 'Personalized email sequences and automation workflows that nurture leads and convert subscribers into loyal customers.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="url(#grad4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="url(#grad4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 2l7.586 7.586" stroke="url(#grad4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11" cy="11" r="2" stroke="url(#grad4)" strokeWidth="2"/>
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Content Marketing',
    description: 'Compelling content strategies that establish thought leadership, improve SEO rankings, and attract your ideal audience.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="url(#grad5)" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="url(#grad5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 8l2-2" stroke="url(#grad5)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 8L6 6" stroke="url(#grad5)" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Branding Strategy',
    description: 'Comprehensive brand development that creates memorable identities and positions your business for long-term success.'
  },
  {
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="url(#grad6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="url(#grad6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Web Development',
    description: 'High-performance websites and landing pages optimized for conversions, speed, and seamless user experiences.'
  }
]

function ServiceCardComponent({ service }: { service: ServiceCard }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate angle from center to mouse position
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90

    card.style.setProperty('--gradient-angle', `${angle}deg`)
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="service-card group relative rounded-2xl transition-all duration-300 hover:shadow-2xl"
      style={{
        '--gradient-angle': '0deg',
        background: '#e2e8f0',
        padding: '2px',
      } as React.CSSProperties}
    >
      {/* Animated gradient border - shows on hover */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden"
        style={{
          background: `conic-gradient(from var(--gradient-angle), #3B82F6 0%, #8B5CF6 25%, #EC4899 50%, #F97316 75%, #3B82F6 100%)`,
        }}
      />

      {/* Card inner content with white background */}
      <div className="relative z-10 bg-white rounded-[14px] p-8 md:p-10 min-h-[320px] md:min-h-[350px] flex flex-col h-full">
        {/* Icon */}
        <div className="mb-5">
          {service.icon}
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-base text-slate-500 leading-relaxed mb-auto">
          {service.description}
        </p>

        {/* Learn More Button */}
        <button className="mt-6 w-full py-3 px-6 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-orange-500 hover:brightness-110 transition-all duration-300">
          Learn More
        </button>
      </div>
    </div>
  )
}

export default function ServicesGradient() {
  return (
    <section className="w-full bg-white py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-6">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <span className="text-sm font-medium text-slate-600">Our Core Services</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 max-w-3xl mx-auto">
            Solutions Designed to Grow Your <em className="not-italic font-bold italic">Business</em>
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <ServiceCardComponent key={index} service={service} />
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 md:mt-16 bg-slate-800 rounded-2xl p-6 md:p-8 text-center">
          <p className="text-lg md:text-xl text-white">
            Looking for a tailored approach? Let&apos;s design a strategy that fits your goals.{' '}
            <a 
              href="#contact" 
              className="font-semibold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-orange-300 transition-all duration-300"
            >
              Book Your Free Consultation Today!
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
