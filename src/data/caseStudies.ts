export type CaseStudy = {
  slug: string;
  date: string;
  title: string;
  src: string;
  author: string;
  authorTitle?: string;
  description: string;
  readTime?: string;
  sections?: { id: string; heading: string; content: string }[];
  keyTakeaways?: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "vegout-organics",
    date: "Jan 8, 2026",
    title: "Everything You Need to Know About Advertising on AI Search Engines",
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    author: "Sarah Berry",
    authorTitle: "Lead Web Marketing Consultant",
    description:
      "A deep dive into AI search engine advertising: what it is, why it matters, and how to get found. Covers Microsoft Copilot, AI Overviews, Perplexity, and paid strategies.",
    readTime: "8 min read",
    keyTakeaways: [
      "What is AI search engine advertising?",
      "Why advertise on AI search engines?",
      "Which AI search engines support advertising?",
      "AI search advertising platforms",
      "FAQs",
    ],
    sections: [
      {
        id: "what-is",
        heading: "What is AI search engine advertising?",
        content:
          "AI search engine advertising refers to paid placements and strategies within AI-powered search experiences like pay-per-click (PPC) on Microsoft's Copilot, AI Overviews, and similar surfaces. Brands can reach users at the moment of intent with relevant, native-style ads.",
      },
      {
        id: "why-advertise",
        heading: "Why advertise on AI search engines?",
        content:
          "Get the first-mover advantage, improve paid performance, and reach users across search experiences. Scale marketing efforts, expand revenue streams, and offset decreased performance in traditional search by showing up where answers are generated.",
      },
      {
        id: "which-engines",
        heading: "Which AI search engines support advertising?",
        content:
          "Microsoft Copilot, Google AI Overviews, and Perplexity are among the key AI search advertising platforms. Each offers different formats and targeting; we cover setup and best practices for getting found on AI search.",
      },
      {
        id: "outcomes",
        heading: "Get found on AI search engines with paid ads",
        content:
          "Paid ads on AI search engines can drive qualified traffic and conversions. Focus on clear headlines, relevant landing pages, and measurement tied to your goals. Combine with organic strategies for full coverage.",
      },
    ],
  },
  {
    slug: "ecommerce-platform",
    date: "Feb 26, 2026",
    title: "E-commerce Platform – Case Study",
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    author: "Product & Engineering",
    description:
      "Led design and development of a modern e-commerce platform with real-time inventory and checkout. Stack: Next.js, Stripe, Postgres. Outcomes: 40% faster checkout, 25% higher conversion.",
    readTime: "8 min read",
    keyTakeaways: [
      "What is this e-commerce platform?",
      "Why modernize checkout?",
      "Which stack was used?",
      "Outcomes and metrics",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "This case study covers the design and development of a modern e-commerce platform with real-time inventory and a streamlined checkout. The stack included Next.js, Stripe, and Postgres. Key outcomes were 40% faster checkout and 25% higher conversion.",
      },
      {
        id: "approach",
        heading: "Approach and execution",
        content:
          "We focused on reducing friction in the checkout flow, adding real-time stock visibility, and ensuring mobile-first performance. Payment integration via Stripe and a clean Postgres-backed inventory system allowed for reliable, scalable operations.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "The project delivered 40% faster checkout completion and a 25% lift in conversion. Real-time inventory reduced support tickets and cart abandonment from out-of-stock items.",
      },
    ],
  },
  {
    slug: "fashion-brand-experience",
    date: "Jan 14, 2026",
    title: "Fashion Brand Experience – Case Study",
    src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    author: "Brand & Web",
    description:
      "End-to-end digital experience for a fashion brand: campaign site, lookbook, and integrated shop. Focus on performance and visual storytelling. Outcomes: 2x engagement, 30% lower bounce on mobile.",
    readTime: "6 min read",
    keyTakeaways: [
      "What is the fashion brand experience?",
      "Why focus on visual storytelling?",
      "Campaign site and lookbook",
      "Outcomes and metrics",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We delivered an end-to-end digital experience for a fashion brand: campaign site, lookbook, and integrated shop. The focus was on performance and visual storytelling. Outcomes included 2x engagement and 30% lower bounce on mobile.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "Engagement doubled and mobile bounce rate dropped by 30%. The lookbook and integrated shop created a cohesive brand experience that drove both awareness and sales.",
      },
    ],
  },
  {
    slug: "serrum-product-launch",
    date: "Dec 3, 2025",
    title: "Serrum Product Launch – Case Study",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    author: "Product & Marketing",
    description:
      "Product launch site and marketing funnel for Serrum: landing pages, waitlist, and email flows. Clean UI and clear CTAs. Outcomes: 5k+ signups in first month, 12% email open rate.",
    readTime: "5 min read",
    keyTakeaways: [
      "What is the Serrum launch?",
      "Landing pages and waitlist",
      "Email flows and CTAs",
      "Outcomes and metrics",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We built the product launch site and marketing funnel for Serrum: landing pages, waitlist, and email flows. Clean UI and clear CTAs drove 5k+ signups in the first month and a 12% email open rate.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "Over 5,000 signups in the first month and a 12% email open rate. The waitlist and email flows kept the audience engaged until launch.",
      },
    ],
  },
  {
    slug: "saas-dashboard-redesign",
    date: "Nov 18, 2025",
    title: "SaaS Dashboard Redesign – Case Study",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    author: "Product & Engineering",
    description:
      "Redesigned analytics dashboard for a B2B SaaS product. New data viz, filters, and export flows. Outcomes: 50% faster task completion, higher NPS.",
    readTime: "7 min read",
    keyTakeaways: [
      "What is the dashboard redesign?",
      "New data viz and filters",
      "Export flows",
      "Outcomes and NPS",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We redesigned the analytics dashboard for a B2B SaaS product with new data visualizations, filters, and export flows. Outcomes included 50% faster task completion and higher NPS.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "Task completion time dropped by 50% and NPS improved. The new data viz and filters made it easier for users to find and act on insights.",
      },
    ],
  },
  {
    slug: "health-app-brand-ux",
    date: "Oct 22, 2025",
    title: "Health App Brand & UX – Case Study",
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    author: "Brand & Web",
    description:
      "Brand identity and app experience for a health startup. Onboarding, habit tracking, and subscription flows. Outcomes: 3x retention at 30 days.",
    readTime: "6 min read",
    keyTakeaways: [
      "What is the health app?",
      "Brand identity and UX",
      "Onboarding and habit tracking",
      "Outcomes and retention",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We created brand identity and app experience for a health startup: onboarding, habit tracking, and subscription flows. Outcomes included 3x retention at 30 days.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "30-day retention tripled. The onboarding and habit-tracking flows kept users engaged and reduced churn in the first month.",
      },
    ],
  },
  {
    slug: "event-platform-launch",
    date: "Sep 10, 2025",
    title: "Event Platform Launch – Case Study",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    author: "Product & Marketing",
    description:
      "Landing and registration experience for a virtual event platform. Ticketing, reminders, and post-event content. Outcomes: 8k+ registrations, 65% attendance.",
    readTime: "5 min read",
    keyTakeaways: [
      "What is the event platform?",
      "Registration and ticketing",
      "Reminders and post-event",
      "Outcomes and attendance",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We built the landing and registration experience for a virtual event platform: ticketing, reminders, and post-event content. Outcomes were 8k+ registrations and 65% attendance.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "Over 8,000 registrations and 65% attendance. The reminder flow and clear ticketing experience helped drive show-up rate.",
      },
    ],
  },
  {
    slug: "fintech-onboarding-flow",
    date: "Aug 5, 2025",
    title: "Fintech Onboarding Flow – Case Study",
    src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    author: "Product & Engineering",
    description:
      "Streamlined KYC and onboarding for a fintech product. Clear steps, progress indicators, and error recovery. Outcomes: 40% fewer drop-offs, faster compliance.",
    readTime: "6 min read",
    keyTakeaways: [
      "What is the fintech onboarding?",
      "KYC and compliance",
      "Progress and error recovery",
      "Outcomes and drop-offs",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We streamlined KYC and onboarding for a fintech product with clear steps, progress indicators, and error recovery. Outcomes included 40% fewer drop-offs and faster compliance.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "Drop-offs fell by 40% and compliance cycles shortened. Progress indicators and error recovery kept users on track through the flow.",
      },
    ],
  },
  {
    slug: "travel-brand-campaign-site",
    date: "Jul 12, 2025",
    title: "Travel Brand Campaign Site – Case Study",
    src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    author: "Brand & Web",
    description:
      "Seasonal campaign site for a travel brand with destination guides and booking hooks. Outcomes: 2.5x time on site, 20% increase in booking starts.",
    readTime: "5 min read",
    keyTakeaways: [
      "What is the travel campaign?",
      "Destination guides",
      "Booking hooks",
      "Outcomes and booking starts",
    ],
    sections: [
      {
        id: "overview",
        heading: "Project overview",
        content:
          "We built a seasonal campaign site for a travel brand with destination guides and booking hooks. Outcomes were 2.5x time on site and a 20% increase in booking starts.",
      },
      {
        id: "outcomes",
        heading: "Outcomes",
        content:
          "Time on site increased 2.5x and booking starts rose 20%. Destination guides and clear booking hooks kept users engaged and converted.",
      },
    ],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((s) => s.slug === slug);
}

export function getAllSlugs(): string[] {
  return caseStudies.map((s) => s.slug);
}
