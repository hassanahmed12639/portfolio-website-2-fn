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
    date: "Feb 26, 2026",
    title: "VegOutOrganics – Advanced Performance Marketing Case Study",
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
    author: "Hassan Ahmed",
    authorTitle: "Google Ads Expert | E-commerce Growth Strategist",
    description:
      "Scaled online sales and revenue for VegOutOrganics with a full-funnel Google Ads strategy: bottom-funnel keywords, Merchant Center optimization, Performance Max, and SKU-level segmentation. Delivered $642K revenue at 2.98x ROAS.",
    readTime: "12 min read",
    keyTakeaways: [
      "Bottom-funnel keyword strategy and product feed optimization",
      "Performance Max with custom audience signals",
      "SKU-level segmentation and real-time optimization",
      "Record-breaking results: $642K revenue, 2.98x ROAS",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "As the Google Ads expert on this project, I led the full-funnel digital strategy for VegOutOrganics, a leading brand in the organic wellness space. The primary goal was to scale online sales while maximizing ROI, focusing on high-intent traffic and efficiently allocating ad spend across high-margin products.",
      },
      {
        id: "keyword-strategy",
        heading: "Bottom-Funnel Keyword Strategy",
        content:
          "To achieve this, I implemented a bottom-funnel keyword strategy targeting high-intent search terms such as \"buy organic spirulina online,\" \"superfoods for immunity,\" and \"vegan plant protein powder.\" Search campaigns were carefully structured by product category, with a mix of exact, phrase, and modified broad match keywords to balance reach with efficiency and minimize wasted spend. Negative keyword sculpting was applied across campaigns to prevent cannibalization and maintain high ROAS.",
      },
      {
        id: "product-feed",
        heading: "Product Feed Optimization",
        content:
          "Simultaneously, I optimized the product feeds in Google Merchant Center by auditing titles, descriptions, category mapping, and GTINs to improve relevance for high-intent searches. Custom labels were added for SKU margin and inventory levels, enabling precise budget allocation for high-margin products. Real-time feed updates ensured that out-of-stock products were excluded, avoiding wasted spend.",
      },
      {
        id: "performance-max",
        heading: "Performance Max & Dynamic Search",
        content:
          "To scale reach, I deployed Performance Max campaigns layered with custom audience signals, targeting in-market health and wellness buyers, recent site visitors, and high-value CRM segments. Campaign assets, including images, product videos, and headlines, were tailored to each SKU category, enhancing audience relevance. Additionally, Dynamic Search campaigns were utilized to capture long-tail demand that traditional search campaigns might miss.",
      },
      {
        id: "segmentation",
        heading: "Campaign Segmentation & Optimization",
        content:
          "Campaigns were segmented by SKU category and ROAS goals, and portfolio bid strategies were applied—Target ROAS for high-margin products and Maximize Conversions for mid-margin SKUs. Real-time performance signals were leveraged to adjust bids dynamically, while automated rules and scripts paused underperforming SKUs and scaled winning campaigns. Ad copy and landing page variations were continuously A/B tested to improve CTR and conversion rates.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "The results were outstanding: VegOutOrganics achieved over 10,200 sales, generated $642,000 in revenue, attained a 2.98x ROAS, and maintained a cost per sale of just $21.14. This campaign set a new performance benchmark in the organic wellness vertical and demonstrated the power of a fully segmented, data-driven approach combining bottom-funnel targeting, feed optimization, and real-time campaign management.",
      },
      {
        id: "key-learnings",
        heading: "Key Learnings",
        content:
          "This project reinforced several key lessons: strategic audience layering and SKU-level segmentation drive efficiency, Performance Max campaigns with custom audience signals can outperform traditional campaigns in e-commerce, and dynamic, real-time optimization is essential for sustained profitability. By integrating these approaches, I was able to deliver measurable, scalable results that positioned VegOutOrganics for continued growth.",
      },
    ],
  },
  {
    slug: "little-laser-clinic",
    date: "Jan 14, 2026",
    title: "Little Laser Clinic – Google Search Ads Case Study",
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "Google Ads Expert",
    description:
      "Increased bookings for Little Laser Clinic through targeted Google Search campaigns. Generated 445 conversions at $20.74 cost per lead and 13.89% CTR, driving appointment calls and website bookings for laser and skincare treatments.",
    readTime: "6 min read",
    keyTakeaways: [
      "Bottom-funnel keyword strategy for local laser and skincare services",
      "Ad copy testing, call extensions, and device bid adjustments",
      "445 conversions at $20.74 cost per lead",
      "Geo-targeting and continuous optimization for local clinics",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "Little Laser Clinic partnered with me to increase bookings for their laser and skincare treatments through a highly targeted Google Search campaign. The objective was to generate booked consultations and appointment calls directly from the website and via click-to-call, focusing exclusively on users with strong purchase intent within the clinic's local area.",
      },
      {
        id: "keyword-strategy",
        heading: "Keyword Strategy & Campaign Structure",
        content:
          "To achieve this, I conducted a bottom-funnel keyword strategy, targeting high-intent search queries such as \"laser hair removal near me\" and \"acne scar treatment.\" Broad or research-oriented keywords were excluded to prevent wasted spend and ensure the traffic generated was ready to convert. Ad groups were organized by service category, allowing precise bid adjustments and performance tracking at the treatment level.",
      },
      {
        id: "ad-copy",
        heading: "Ad Copy, Extensions & Optimization",
        content:
          "Multiple ad copy variations were tested, emphasizing service benefits, limited-time offers, and trust-building elements such as certifications and client testimonials. To maximize conversions, I implemented call extensions, appointment-focused sitelinks, and device-level bid adjustments. Real-time performance data was leveraged to pause underperforming keywords and ad variations while reallocating budget to high-performing services, ensuring maximum efficiency.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "This data-driven, full-funnel approach delivered 445 conversions at a cost per lead of just $20.74, accompanied by an impressive 13.89% CTR. The campaign not only generated a high volume of quality leads but also proved to be one of the most cost-effective initiatives in the clinic's growth strategy, significantly boosting bookings for high-value treatments.",
      },
      {
        id: "takeaway",
        heading: "Key Takeaway",
        content:
          "Through precise geo-targeting, audience intent optimization, and continuous campaign refinement, this project demonstrated the impact of focused Google Search advertising in driving measurable business results for local clinics.",
      },
    ],
  },
  {
    slug: "comporta-experience",
    date: "Dec 3, 2025",
    title: "Comporta Experience – Google Search Ads Case Study",
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "Google Ads Expert",
    description:
      "Drove booking inquiries and conversions for Comporta Experience's luxury villas in Portugal. Delivered 269 conversions across two campaigns with CTRs above 12%, targeting affluent travelers and property buyers across Europe.",
    readTime: "7 min read",
    keyTakeaways: [
      "Intent-driven keyword strategy for luxury villas and real estate",
      "Two-phase campaign execution with improved cost per conversion",
      "269 conversions, 12%+ CTR, geo-targeting across high-value markets",
      "Responsive search ads and continuous bid optimization",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "Comporta Experience partnered with me to drive booking inquiries and website conversions for their premium villas and real estate offerings in Comporta, Portugal. The target audience consisted of affluent travelers and property buyers searching for luxury stays and real estate, primarily in Europe and high-income international markets. The goal was to generate high-quality leads while maintaining cost efficiency and maximizing ROI.",
      },
      {
        id: "campaign-results",
        heading: "Campaign Results",
        content:
          "The campaigns were executed in two phases, each optimized for performance and scalability. The first campaign delivered 113 conversions at a CTR of 13.91%, with a total ad spend of €7.99K, resulting in a cost per conversion of €70.73. Building on these insights, the second campaign improved results further — driving 156 conversions at a CTR of 12.57%, with €9K in spend and an improved cost per conversion of €57.70. Together, both campaigns produced 269 high-quality conversions while maintaining CTRs above 12%, demonstrating effective targeting and compelling ad messaging.",
      },
      {
        id: "keyword-strategy",
        heading: "Keyword Strategy & Ad Copy",
        content:
          "To achieve these results, I implemented an intent-driven keyword strategy, focusing on high-value queries such as \"luxury villas in Comporta,\" \"Comporta vacation rentals,\" and \"Comporta real estate investment.\" Keywords were organized into tightly themed ad groups to maintain relevance and lower CPCs, while negative keywords filtered out unqualified traffic. Ad copy emphasized exclusivity, elegance, and premium offerings, highlighting features such as private pools, beachfront views, concierge services, and investment opportunities.",
      },
      {
        id: "execution",
        heading: "Execution & Optimization",
        content:
          "Responsive search ads were paired with high-converting landing pages to align messaging with user intent and maximize conversions. Geo-targeting prioritized high-value markets including France, the UK, Germany, and Switzerland, ensuring the campaigns reached the most profitable audiences. Continuous bid optimization and real-time performance monitoring allowed me to pause underperforming keywords and scale top-performing ones, maintaining efficiency across all campaigns.",
      },
      {
        id: "outcome",
        heading: "Outcome",
        content:
          "The result was a consistent stream of high-quality inquiries from booking-ready travelers and investment-minded buyers. CTRs remained above 12% throughout, and the campaigns achieved improved cost-efficiency over time, establishing a scalable and profitable digital strategy for Comporta Experience's luxury offerings.",
      },
    ],
  },
  {
    slug: "trade-locks",
    date: "Nov 15, 2025",
    title: "Tradelocks – Google Search Ads Case Study",
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "Google Ads Expert",
    description:
      "Drove online sales for Tradelocks' locksmith tools and key cutting machines in the UK. Achieved 153 conversions at £14.01 cost per conversion with over 1,300 high-intent clicks through bottom-funnel keyword targeting.",
    readTime: "6 min read",
    keyTakeaways: [
      "Bottom-funnel keyword strategy for locksmith tools and accessories",
      "Tightly themed ad groups and ad extensions",
      "153 conversions at £14.01 cost per conversion",
      "Continuous optimization for scalable e-commerce growth",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "Tradelocks partnered with me to drive online sales and product page conversions for locksmith tools, key cutting machines, and accessories across the United Kingdom. The target audience consisted of locksmiths and security professionals actively searching for purchase-ready solutions. The objective was to attract high-intent buyers and convert them efficiently while maintaining cost-effectiveness.",
      },
      {
        id: "keyword-strategy",
        heading: "Keyword Strategy & Campaign Structure",
        content:
          "To achieve this, I implemented a bottom-funnel keyword strategy focusing on purchase-ready search queries such as \"buy locksmith tools UK,\" \"key cutting machine for sale,\" and product-specific terms like \"Lishi picks\" and \"auto locksmith kits.\" Generic or research-focused keywords were excluded to ensure the traffic generated was highly likely to convert. Ad groups were tightly themed by product type, improving Quality Scores, reducing CPCs, and enabling precise bid management.",
      },
      {
        id: "ad-copy",
        heading: "Ad Copy, Extensions & Optimization",
        content:
          "Custom ad copy emphasized key USPs including UK-wide delivery, professional-grade quality, and limited-time offers, while ad extensions such as sitelinks, callouts, and structured snippets guided users deeper into the site and increased engagement. Campaign performance was continuously monitored and optimized, pausing underperforming keywords, scaling high-performing ads, and reallocating budget to maximize efficiency.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "The campaign achieved over 1,300 high-intent clicks and 153 conversions at a cost per conversion of just £14.01, demonstrating its profitability and scalability. By targeting ready-to-buy users with a highly relevant and optimized campaign structure, Tradelocks experienced a significant boost in product sales, establishing a replicable strategy for long-term growth.",
      },
    ],
  },
  {
    slug: "driveucars",
    date: "Oct 20, 2025",
    title: "DriveUCars – Google Search Ads Case Study",
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "Google Ads Expert",
    description:
      "Generated phone calls and website conversions for DriveUCars across the USA. Delivered 277 phone calls and 167 website conversions with $1.48K ad spend through bottom-funnel, purchase-ready keyword targeting.",
    readTime: "5 min read",
    keyTakeaways: [
      "Bottom-funnel keyword strategy for car rental",
      "Tightly themed ad groups and A/B tested ad copy",
      "277 phone calls + 167 website conversions, $1.48K spend",
      "Data-driven targeting for ready-to-book customers",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "DriveUCars partnered with me to generate phone calls and website conversions from users ready to rent a car across the USA. The goal was to attract high-intent customers actively searching for flexible and affordable car rentals, ensuring every click translated into a qualified lead.",
      },
      {
        id: "keyword-strategy",
        heading: "Keyword Strategy & Campaign Structure",
        content:
          "To achieve this, I conducted in-depth keyword research to focus on bottom-funnel, purchase-ready queries such as \"car rental near me\" and \"best car rentals.\" Generic or broad search terms were excluded to maintain high relevance and reduce wasted spend. Campaigns were organized into tightly themed ad groups, allowing precise bid adjustments and performance tracking at the search query level.",
      },
      {
        id: "ad-copy",
        heading: "Ad Copy & Optimization",
        content:
          "I crafted multiple ad copy variations, emphasizing key benefits such as flexible rental options, competitive pricing, and convenience. Ads were continuously A/B tested, with underperforming variations paused and budgets reallocated to top-performing ads to maximize click-through rates and conversions.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "The results were strong and highly efficient: the campaign generated 277 phone calls and 167 website conversions, with a total ad spend of just $1.48K. By combining data-driven targeting, continuous optimization, and highly relevant ad messaging, the campaign delivered ready-to-book customers and maximized ROI for DriveUCars, establishing a scalable and profitable search strategy for the rental market.",
      },
    ],
  },
  {
    slug: "rcc-custom-landscapes",
    date: "Oct 10, 2025",
    title: "RC Custom Landscapes – Google Search Ads Case Study",
    src: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "Google Ads Expert",
    description:
      "Generated phone calls and form submissions for RC Custom Landscapes across the USA. Achieved 360+ conversions with 12.21% CTR through high-intent keyword targeting for landscaping, hardscaping, and outdoor design services.",
    readTime: "6 min read",
    keyTakeaways: [
      "Bottom-funnel keyword strategy for landscaping and outdoor design",
      "Ad copy testing with trust signals and ad extensions",
      "360+ conversions, 12.21% CTR, competitive cost per lead",
      "Continuous optimization and peak-hour scheduling",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "RC Custom Landscapes partnered with me to generate phone calls and form submissions from homeowners actively seeking premium landscaping and outdoor design services across the United States, with a local focus on high-value service areas. The campaign's objective was to capture high-intent traffic and turn searchers into qualified leads.",
      },
      {
        id: "keyword-strategy",
        heading: "Keyword Strategy & Campaign Structure",
        content:
          "To achieve this, I conducted detailed keyword research, targeting search terms that indicated strong purchase intent, such as \"landscaping companies near me,\" \"custom backyard design,\" and \"retaining wall installation.\" Broad or informational queries were excluded to ensure the traffic was ready to convert. Ad groups were organized by service type, enabling precise bid management and performance tracking.",
      },
      {
        id: "ad-copy",
        heading: "Ad Copy, Extensions & Scheduling",
        content:
          "Multiple ad copy variations were tested, emphasizing RC Custom Landscapes' specialties—including custom hardscaping, patio builds, and water features—while incorporating trust signals such as licensed professionals and free consultations. Ad extensions, including callouts, sitelinks, and structured snippets, were enabled to boost engagement, and ads were scheduled during peak hours to maximize visibility when users were most likely to convert.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "Throughout the campaign, I continuously monitored performance, optimized bids, paused underperforming keywords, and reallocated budget toward high-performing services. The results were strong: the campaign generated over 360 conversions at a competitive cost per lead, with a 12.21% CTR, demonstrating that the strategy was attracting highly relevant users ready to take action and driving real business growth for RC Custom Landscapes.",
      },
    ],
  },
  {
    slug: "mala-yachts",
    date: "Sep 25, 2025",
    title: "Mala Yachts (Mala.ae) – Full-Stack SEO Case Study",
    src: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "SEO Specialist",
    description:
      "Full-stack SEO for Mala Yachts' luxury yacht rentals and cruises in Dubai. Grew daily impressions from under 500 to over 30,000, generating 5.7M impressions and 101K clicks, positioning Mala.ae as a leading name in Dubai's yacht rental sector.",
    readTime: "8 min read",
    keyTakeaways: [
      "Technical SEO overhaul and site architecture refinement",
      "Keyword mapping for yacht rental Dubai and dinner cruise queries",
      "Long-form content, local SEO, and GMB optimization",
      "5.7M impressions, 101K clicks, 30,000+ daily impressions",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "Mala Yachts partnered with me to dominate search visibility for luxury yacht rentals, cruises, and events in Dubai, targeting tourists, UAE residents, event organizers, and corporate clients. The objective was to increase organic lead flow, rank for high-conversion keywords, and strengthen the brand's online presence in the competitive luxury tourism market.",
      },
      {
        id: "technical-seo",
        heading: "Technical SEO & Keyword Strategy",
        content:
          "The project began with a complete technical SEO overhaul, addressing critical issues such as indexation errors, duplicate pages, and mobile performance optimization. Site architecture was refined to ensure fast load times, crawl efficiency, and a smooth user experience. I then performed detailed keyword mapping, targeting high-converting terms such as \"yacht rental Dubai\" and \"dinner cruise Dubai Marina,\" strategically integrating them across core service pages, local landing pages, and blog content to capture both transactional and informational queries.",
      },
      {
        id: "content-local",
        heading: "Content, Local SEO & Optimization",
        content:
          "To support long-term authority and engagement, I created long-form, SEO-rich guides on topics like yacht parties and Dubai sea tours, enhanced with schema markup, internal linking, and multimedia elements. Local SEO and Google My Business optimization ensured Mala Yachts appeared prominently in map packs, capturing nearby searches and high-intent local traffic. Performance was continuously monitored through Google Search Console, identifying top-performing pages for improvement. Updates included stronger CTAs, refined meta content, and UX adjustments, all aimed at maximizing conversions from organic traffic.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "The results were remarkable: Mala.ae grew from under 500 daily impressions to over 30,000 daily impressions, generating 5.7 million impressions and 101,000 clicks. These efforts firmly positioned Mala Yachts as a leading name in Dubai's yacht rental and luxury tourism sector, driving a significant increase in organic leads and consolidating the brand's authority in the market.",
      },
    ],
  },
  {
    slug: "steve-apparel",
    date: "Sep 15, 2025",
    title: "Steve Apparel – Full-Stack SEO Case Study",
    src: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "SEO Specialist",
    description:
      "Full-stack SEO for Steve Apparel's B2B private label and custom apparel services. Delivered 22.9K organic clicks and 1.32M impressions within six months, establishing topical authority in the custom apparel industry.",
    readTime: "7 min read",
    keyTakeaways: [
      "Technical SEO audit and infrastructure optimization",
      "Keyword mapping for private label and custom apparel queries",
      "Long-form content, schema markup, and CTA optimization",
      "22.9K clicks, 1.32M impressions within six months",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "Steve Apparel partnered with me to improve search engine visibility and lead generation for B2B fashion startups, clothing brands, and retailers seeking private label or custom apparel services in the USA, with secondary visibility in Canada and the UK. The objective was to capture bottom-funnel leads, improve rankings for high-intent search terms, and establish topical authority in the custom apparel industry.",
      },
      {
        id: "technical-keyword",
        heading: "Technical SEO & Keyword Strategy",
        content:
          "The project began with a comprehensive technical SEO audit, addressing crawl errors, broken links, and slow-loading pages to ensure a solid foundation for long-term organic growth. Once the technical infrastructure was optimized, I conducted keyword mapping, targeting high-intent queries such as \"private label clothing manufacturer USA\" and \"custom t-shirt printing service,\" integrating them strategically across core service pages and blog content.",
      },
      {
        id: "content-optimization",
        heading: "Content, Authority & Optimization",
        content:
          "To build authority and engagement, I produced long-form, research-backed articles on topics like MOQ manufacturing, startup apparel branding, and production best practices. These pages were enhanced with internal linking, schema markup, and structured content, ensuring higher relevance and improved search visibility. Performance tracking via Google Search Console allowed for continuous optimization, including A/B testing of page titles, meta descriptions, and CTAs, maximizing click-through rates and conversion potential.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "Within six months, these efforts yielded over 22.9K organic clicks and 1.32 million impressions, driving highly qualified leads from B2B fashion brands and solidifying Steve Apparel's authority in the private label and custom apparel space. The campaign demonstrated how a full-stack, data-driven SEO approach could generate measurable growth, increase visibility for high-intent queries, and establish long-term industry leadership.",
      },
    ],
  },
  {
    slug: "alliance-shipping",
    date: "Sep 5, 2025",
    title: "Alliance Shipping – Technical & Content SEO Case Study",
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    author: "Hassan Ahmed",
    authorTitle: "SEO Specialist",
    description:
      "Technical and content SEO for Alliance Shipping's international freight services. Delivered 1.09M impressions and 15,200 organic clicks within six months, establishing authority in the logistics sector across UAE, Pakistan, and USA.",
    readTime: "7 min read",
    keyTakeaways: [
      "Comprehensive SEO audit and technical optimization",
      "Keyword mapping for freight forwarding and cargo shipping",
      "In-depth content on customs, cargo village, and freight management",
      "1.09M impressions, 15,200 clicks within six months",
    ],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        content:
          "Alliance Shipping partnered with me to improve organic visibility and lead generation for businesses and individuals seeking reliable international shipping and freight services. The target audience included global clients, with regional focus on the UAE, Pakistan, and the USA. The objective was to increase visibility for high-intent, bottom-funnel keywords, drive qualified organic traffic, and strengthen the domain's authority in the competitive logistics sector.",
      },
      {
        id: "technical-keyword",
        heading: "Technical SEO & Keyword Strategy",
        content:
          "The project began with a comprehensive SEO audit, addressing technical issues such as crawl errors, broken links, and site structure inefficiencies. Following this, I conducted strategic keyword mapping to target high-conversion search queries like \"freight forwarding Dubai\" and \"cargo shipping from Karachi to USA.\" In-depth content was created around key topics including Dubai Cargo Village, customs procedures, and freight management tips, with SEO-friendly URLs, structured data, and internal linking enhancing both user experience and search engine visibility.",
      },
      {
        id: "optimization",
        heading: "Continuous Refinement & Optimization",
        content:
          "Campaign performance was continuously refined using Google Search Console and analytics data. Adjustments included optimizing meta titles and descriptions, refining CTAs, and expanding content based on top-performing pages and queries.",
      },
      {
        id: "results",
        heading: "Results",
        content:
          "Within six months, Alliance Shipping achieved over 1.09 million impressions and 15,200 organic clicks, with steadily rising CTRs and increasing visibility in AI-generated search summaries. These results firmly established Alliance Shipping as an authority in logistics and international freight search results, driving a consistent flow of qualified leads and reinforcing the brand's presence in key markets.",
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
