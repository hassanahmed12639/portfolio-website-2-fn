export type Template = {
  id: string
  name: string
  category: string
  type: 'gtm-web' | 'gtm-tpl' | 'sgtm' | 'shopify' | 'wordpress' | 'webflow' | 'html'
  platform: string[]
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  requiredPlan: 'free' | 'pro' | 'agency'
  tags: string[]
  previewCode: string
  fileName: string
}

const PLAN_ORDER = { free: 0, pro: 1, agency: 2 } as const
export function canAccessTemplate(
  userPlan: 'free' | 'trial' | 'pro' | 'agency',
  requiredPlan: 'free' | 'pro' | 'agency'
): boolean {
  const userLevel = userPlan === 'trial' ? 1 : PLAN_ORDER[userPlan as keyof typeof PLAN_ORDER] ?? 0
  const requiredLevel = PLAN_ORDER[requiredPlan]
  return userLevel >= requiredLevel
}

export const TEMPLATES: Template[] = [
  // ============ E-COMMERCE GTM WEB ============
  {
    id: 'gtm-purchase',
    name: 'Purchase Event Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok', 'snapchat'],
    description: 'Complete purchase tracking with order value, currency, order ID, and customer email for maximum CAPI match rate',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['purchase', 'ecommerce', 'conversion', 'capi'],
    fileName: 'gtm-purchase.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Purchase
  // Trigger: Thank you / Order confirmation page
  window.TrackHive.track('Purchase', {
    value: {{Order Total}},
    currency: '{{Currency Code}}',
    email: '{{Customer Email}}',
    phone: '{{Customer Phone}}',
    event_id: '{{Order ID}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-add-to-cart',
    name: 'Add to Cart Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track add to cart with product price and ID. Fires on button click trigger.',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['cart', 'ecommerce', 'product'],
    fileName: 'gtm-add-to-cart.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Add to Cart
  // Trigger: Click — Add to Cart button
  window.TrackHive.track('AddToCart', {
    value: {{Product Price}},
    currency: '{{Currency}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-initiate-checkout',
    name: 'Initiate Checkout Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track checkout starts with cart value for funnel analysis',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['checkout', 'ecommerce', 'funnel'],
    fileName: 'gtm-checkout.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Initiate Checkout
  // Trigger: Page View — Checkout URL
  window.TrackHive.track('InitiateCheckout', {
    value: {{Cart Total}},
    currency: '{{Currency}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-view-content',
    name: 'Product View Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok', 'snapchat'],
    description: 'Track product page views with price data for ViewContent event',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['product', 'view', 'ecommerce'],
    fileName: 'gtm-view-content.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — View Content
  // Trigger: Page View — Product Pages
  window.TrackHive.track('ViewContent', {
    value: {{Product Price}},
    currency: '{{Currency}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-refund',
    name: 'Refund Event Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['google'],
    description: 'Track refunds for accurate ROAS and profit calculation in Google Ads',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['refund', 'ecommerce', 'roas'],
    fileName: 'gtm-refund.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Refund
  window.TrackHive.track('Refund', {
    value: {{Refund Amount}},
    currency: '{{Currency}}',
    event_id: '{{Order ID}}'
  });
</script>`,
  },
  {
    id: 'gtm-search',
    name: 'Search Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track search events to understand what users are looking for',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['search', 'ecommerce'],
    fileName: 'gtm-search.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Search
  // Trigger: Page View — Search Results URL contains ?q=
  window.TrackHive.track('Search', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-payment-info',
    name: 'Payment Info Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta'],
    description: 'Track when users add payment information in checkout',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['payment', 'checkout', 'funnel'],
    fileName: 'gtm-payment.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Add Payment Info
  window.TrackHive.track('AddPaymentInfo', {
    value: {{Cart Total}},
    currency: '{{Currency}}'
  });
</script>`,
  },
  {
    id: 'gtm-wishlist',
    name: 'Wishlist Add Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'tiktok'],
    description: 'Track wishlist additions for retargeting high intent users',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['wishlist', 'ecommerce', 'retargeting'],
    fileName: 'gtm-wishlist.json',
    previewCode: `<script>
  window.TrackHive.track('AddToWishlist', {
    value: {{Product Price}},
    currency: '{{Currency}}'
  });
</script>`,
  },
  {
    id: 'gtm-complete-registration',
    name: 'Registration Complete Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track user account creation with email for CAPI matching',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['registration', 'signup', 'ecommerce'],
    fileName: 'gtm-registration.json',
    previewCode: `<script>
  window.TrackHive.track('CompleteRegistration', {
    email: '{{User Email}}'
  });
</script>`,
  },
  {
    id: 'gtm-subscription',
    name: 'Subscription Purchase Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track subscription purchases with recurring value for LTV optimization',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['subscription', 'recurring', 'ltv'],
    fileName: 'gtm-subscription.json',
    previewCode: `<script>
  window.TrackHive.track('Subscribe', {
    value: {{Plan Price}},
    currency: '{{Currency}}',
    email: '{{Customer Email}}'
  });
</script>`,
  },
  {
    id: 'gtm-remove-from-cart',
    name: 'Remove from Cart Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track when users remove items from cart for funnel drop-off analysis',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['cart', 'ecommerce', 'funnel'],
    fileName: 'gtm-remove-cart.json',
    previewCode: `<script>
  window.TrackHive.track('RemoveFromCart', {
    value: {{Product Price}},
    currency: '{{Currency}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-collection-view',
    name: 'Collection/Category View Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track category or collection page views for browse behavior',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['collection', 'category', 'ecommerce'],
    fileName: 'gtm-collection.json',
    previewCode: `<script>
  window.TrackHive.track('ViewCategory', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-begin-checkout',
    name: 'Begin Checkout (Multi-Step)',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Fire on first checkout step with cart contents for multi-step checkout',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['checkout', 'ecommerce', 'funnel'],
    fileName: 'gtm-begin-checkout.json',
    previewCode: `<script>
  window.TrackHive.track('BeginCheckout', {
    value: {{Cart Total}},
    currency: '{{Currency}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-add-shipping-info',
    name: 'Add Shipping Info Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta'],
    description: 'Track when users add shipping address in checkout',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['shipping', 'checkout', 'funnel'],
    fileName: 'gtm-shipping.json',
    previewCode: `<script>
  window.TrackHive.track('AddShippingInfo', {
    value: {{Cart Total}},
    currency: '{{Currency}}'
  });
</script>`,
  },
  {
    id: 'gtm-promo-view',
    name: 'Promo View Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track when users view a promotion or discount code',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['promo', 'ecommerce', 'discount'],
    fileName: 'gtm-promo.json',
    previewCode: `<script>
  window.TrackHive.track('PromoView', {
    event_source_url: window.location.href
  });
</script>`,
  },
  // ============ LEAD GENERATION ============
  {
    id: 'gtm-lead-form',
    name: 'Lead Form Submission',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google', 'snapchat'],
    description: 'Track form submissions and capture email for CAPI match rate improvement',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['lead', 'form', 'email'],
    fileName: 'gtm-lead-form.json',
    previewCode: `<script>
  // GTM Custom HTML Tag — Lead Form
  // Trigger: Form Submission
  var email = document.querySelector('input[type="email"]');
  window.TrackHive.track('Lead', {
    email: email ? email.value : '',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-phone-click',
    name: 'Phone Click Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track clicks on phone number links with Click URL trigger',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['phone', 'click', 'lead'],
    fileName: 'gtm-phone.json',
    previewCode: `<script>
  // Trigger: Click — Link Click URL contains tel:
  window.TrackHive.track('PhoneClick', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-whatsapp-click',
    name: 'WhatsApp Click Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta'],
    description: 'Track WhatsApp button clicks — huge for Middle East and Asian markets',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['whatsapp', 'click', 'lead'],
    fileName: 'gtm-whatsapp.json',
    previewCode: `<script>
  // Trigger: Click — Link Click URL contains wa.me
  window.TrackHive.track('WhatsAppClick', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-email-click',
    name: 'Email Click Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track email link clicks as lead events',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['email', 'click', 'lead'],
    fileName: 'gtm-email-click.json',
    previewCode: `<script>
  // Trigger: Click — Link Click URL contains mailto:
  window.TrackHive.track('EmailClick', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-calendar-booking',
    name: 'Calendar Booking Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track Calendly or calendar booking completions as high value leads',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['calendar', 'booking', 'lead', 'calendly'],
    fileName: 'gtm-calendar.json',
    previewCode: `<script>
  // Trigger: Page View — URL contains calendly.com/confirmed
  // OR Custom Event from Calendly embed
  window.TrackHive.track('Schedule', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-chat-open',
    name: 'Live Chat Open Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track live chat initiations as lead signals',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['chat', 'lead', 'engagement'],
    fileName: 'gtm-chat.json',
    previewCode: `<script>
  window.TrackHive.track('InitiateChat', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-trial-signup',
    name: 'Free Trial Signup Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track free trial signups with email for SaaS businesses',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['trial', 'saas', 'signup'],
    fileName: 'gtm-trial.json',
    previewCode: `<script>
  window.TrackHive.track('StartTrial', {
    email: '{{User Email}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-demo-request',
    name: 'Demo Request Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google', 'linkedin'],
    description: 'Track demo request form submissions as high value B2B leads',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['demo', 'b2b', 'lead'],
    fileName: 'gtm-demo.json',
    previewCode: `<script>
  window.TrackHive.track('RequestDemo', {
    email: '{{Form Email}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-newsletter-signup',
    name: 'Newsletter Signup Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track newsletter or email list signups as lead events',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['newsletter', 'lead', 'email'],
    fileName: 'gtm-newsletter.json',
    previewCode: `<script>
  window.TrackHive.track('Lead', {
    email: '{{Subscriber Email}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-contact-form',
    name: 'Generic Contact Form Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track any contact form submission with optional email capture',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['contact', 'form', 'lead'],
    fileName: 'gtm-contact.json',
    previewCode: `<script>
  window.TrackHive.track('Contact', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-quote-request',
    name: 'Quote Request Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track quote or pricing request form submissions',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['quote', 'lead', 'b2b'],
    fileName: 'gtm-quote.json',
    previewCode: `<script>
  window.TrackHive.track('RequestQuote', {
    event_source_url: window.location.href
  });
</script>`,
  },
  // ============ ENGAGEMENT ============
  {
    id: 'gtm-scroll-depth',
    name: 'Scroll Depth Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google', 'ga4'],
    description: 'Track 25%, 50%, 75%, 90% scroll depth for content engagement analysis',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['scroll', 'engagement', 'content'],
    fileName: 'gtm-scroll.json',
    previewCode: `<script>
  // Trigger: Scroll Depth — 25, 50, 75, 90 percent
  window.TrackHive.track('ScrollDepth', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-video-watch',
    name: 'Video Watch Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track YouTube and Vimeo video watches at 25%, 50%, 75%, 100% completion',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['video', 'youtube', 'engagement'],
    fileName: 'gtm-video.json',
    previewCode: `<script>
  // Trigger: YouTube Video — 25, 50, 75, 100 percent
  window.TrackHive.track('VideoWatch', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-exit-intent',
    name: 'Exit Intent Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta'],
    description: 'Track when users are about to leave for retargeting campaigns',
    difficulty: 'advanced',
    requiredPlan: 'pro',
    tags: ['exit', 'retargeting', 'engagement'],
    fileName: 'gtm-exit.json',
    previewCode: `<script>
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 0) {
      window.TrackHive.track('ExitIntent', {
        event_source_url: window.location.href
      });
    }
  });
</script>`,
  },
  {
    id: 'gtm-time-on-page',
    name: 'Time on Page Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Fire events at 30s, 60s, 120s time intervals to measure engagement quality',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['time', 'engagement', 'quality'],
    fileName: 'gtm-time.json',
    previewCode: `<script>
  // Trigger: Timer — 30000ms interval
  window.TrackHive.track('TimeOnPage', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-pdf-download',
    name: 'PDF Download Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track PDF and file downloads as lead or engagement events',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['pdf', 'download', 'content'],
    fileName: 'gtm-pdf.json',
    previewCode: `<script>
  // Trigger: Click — Link URL contains .pdf
  window.TrackHive.track('Download', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-button-click',
    name: 'CTA Button Click Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track important CTA button clicks with button text identification',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['button', 'cta', 'click'],
    fileName: 'gtm-button.json',
    previewCode: `<script>
  // Trigger: Click — All Elements — CSS Selector .cta-button
  window.TrackHive.track('CTAClick', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-social-share',
    name: 'Social Share Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track social sharing buttons for viral content analysis',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['social', 'share', 'viral'],
    fileName: 'gtm-social.json',
    previewCode: `<script>
  window.TrackHive.track('Share', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-page-view',
    name: 'Page View Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok', 'snapchat'],
    description: 'Track page views for all pages or specific URLs',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['pageview', 'engagement'],
    fileName: 'gtm-pageview.json',
    previewCode: `<script>
  window.TrackHive.track('PageView', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-outbound-click',
    name: 'Outbound Link Click Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google', 'ga4'],
    description: 'Track clicks to external domains for referral analysis',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['outbound', 'click', 'links'],
    fileName: 'gtm-outbound.json',
    previewCode: `<script>
  window.TrackHive.track('OutboundClick', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-form-start',
    name: 'Form Start Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track when user focuses or starts filling a form (form start)',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['form', 'engagement', 'funnel'],
    fileName: 'gtm-form-start.json',
    previewCode: `<script>
  window.TrackHive.track('FormStart', {
    event_source_url: window.location.href
  });
</script>`,
  },
  // ============ PLATFORM SPECIFIC ============
  {
    id: 'gtm-meta-capi-combo',
    name: 'Meta Pixel + CAPI Full Setup',
    category: 'Platform Specific',
    type: 'gtm-web',
    platform: ['meta'],
    description: 'Complete Meta setup: browser pixel fires + server CAPI fires with deduplication via event_id',
    difficulty: 'advanced',
    requiredPlan: 'free',
    tags: ['meta', 'capi', 'deduplication', 'pixel'],
    fileName: 'gtm-meta-full.json',
    previewCode: `<script>
  // Step 1: Fire browser pixel (for redundancy)
  fbq('track', 'Purchase', {
    value: {{Order Total}},
    currency: '{{Currency}}'
  }, { eventID: '{{Order ID}}' }); // eventID for dedup

  // Step 2: Fire server CAPI via TrackHive
  window.TrackHive.track('Purchase', {
    value: {{Order Total}},
    currency: '{{Currency}}',
    email: '{{Customer Email}}',
    event_id: '{{Order ID}}' // same ID = Meta deduplicates
  });
</script>`,
  },
  {
    id: 'gtm-google-enhanced',
    name: 'Google Enhanced Conversions Full Setup',
    category: 'Platform Specific',
    type: 'gtm-web',
    platform: ['google'],
    description: 'Complete Google Enhanced Conversions with hashed email and phone',
    difficulty: 'advanced',
    requiredPlan: 'pro',
    tags: ['google', 'enhanced', 'conversions'],
    fileName: 'gtm-google-full.json',
    previewCode: `<script>
  window.TrackHive.track('Purchase', {
    value: {{Order Total}},
    currency: '{{Currency}}',
    email: '{{Customer Email}}',
    phone: '{{Customer Phone}}'
    // TrackHive auto-hashes email + phone for Google
  });
</script>`,
  },
  {
    id: 'gtm-tiktok-events',
    name: 'TikTok Events API Setup',
    category: 'Platform Specific',
    type: 'gtm-web',
    platform: ['tiktok'],
    description: 'TikTok pixel + Events API with browser and server deduplication',
    difficulty: 'advanced',
    requiredPlan: 'pro',
    tags: ['tiktok', 'events', 'capi'],
    fileName: 'gtm-tiktok-full.json',
    previewCode: `<script>
  // TikTok browser pixel
  ttq.track('CompletePayment', {
    value: {{Order Total}},
    currency: '{{Currency}}'
  });
  // TikTok server events via TrackHive
  window.TrackHive.track('Purchase', {
    value: {{Order Total}},
    currency: '{{Currency}}',
    email: '{{Customer Email}}'
  });
</script>`,
  },
  {
    id: 'gtm-snapchat-capi',
    name: 'Snapchat CAPI Setup',
    category: 'Platform Specific',
    type: 'gtm-web',
    platform: ['snapchat'],
    description: 'Snapchat Conversions API with hashed user data',
    difficulty: 'advanced',
    requiredPlan: 'pro',
    tags: ['snapchat', 'capi'],
    fileName: 'gtm-snap-full.json',
    previewCode: `<script>
  window.TrackHive.track('Purchase', {
    value: {{Order Total}},
    currency: '{{Currency}}',
    email: '{{Customer Email}}'
  });
</script>`,
  },
  {
    id: 'gtm-ga4-mp',
    name: 'GA4 Measurement Protocol',
    category: 'Platform Specific',
    type: 'gtm-web',
    platform: ['ga4'],
    description: 'GA4 server-side event sending via Measurement Protocol',
    difficulty: 'advanced',
    requiredPlan: 'pro',
    tags: ['ga4', 'analytics', 'measurement'],
    fileName: 'gtm-ga4-full.json',
    previewCode: `<script>
  window.TrackHive.track('Purchase', {
    value: {{Order Total}},
    currency: '{{Currency}}'
  });
</script>`,
  },
  {
    id: 'gtm-linkedin-insight',
    name: 'LinkedIn Insight Tag + CAPI',
    category: 'Platform Specific',
    type: 'gtm-web',
    platform: ['linkedin'],
    description: 'LinkedIn conversion tracking with server-side support',
    difficulty: 'advanced',
    requiredPlan: 'pro',
    tags: ['linkedin', 'b2b', 'conversions'],
    fileName: 'gtm-linkedin.json',
    previewCode: `<script>
  window.TrackHive.track('Lead', {
    email: '{{User Email}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  // ============ SHOPIFY TEMPLATES ============
  {
    id: 'shopify-purchase',
    name: 'Shopify Purchase Tracker',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Add to Shopify thank_you.liquid for purchase tracking with real order data',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['shopify', 'purchase', 'ecommerce'],
    fileName: 'shopify-purchase.liquid',
    previewCode: `{% comment %} Add to thank_you.liquid additional scripts {% endcomment %}
<script>
  window.TRACKHIVE_KEY = "YOUR_API_KEY";
</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.TrackHive.track('Purchase', {
      value: {{ checkout.total_price | divided_by: 100.0 }},
      currency: '{{ shop.currency }}',
      email: '{{ checkout.email }}',
      phone: '{{ checkout.phone }}',
      event_id: '{{ checkout.order_id }}'
    });
  });
</script>`,
  },
  {
    id: 'shopify-add-to-cart',
    name: 'Shopify Add to Cart',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'tiktok'],
    description: 'Track add to cart events in Shopify via theme.liquid',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['shopify', 'cart', 'ecommerce'],
    fileName: 'shopify-cart.liquid',
    previewCode: `<script>
  // Add to product.liquid or via GTM
  document.querySelectorAll('[data-add-to-cart]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      window.TrackHive.track('AddToCart', {
        value: {{ product.price | divided_by: 100.0 }},
        currency: '{{ shop.currency }}'
      });
    });
  });
</script>`,
  },
  {
    id: 'shopify-checkout',
    name: 'Shopify Checkout Tracker',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'google'],
    description: 'Track checkout initiation in Shopify checkout.liquid',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['shopify', 'checkout'],
    fileName: 'shopify-checkout.liquid',
    previewCode: `{% if checkout %}
<script>
  window.TrackHive.track('InitiateCheckout', {
    value: {{ checkout.total_price | divided_by: 100.0 }},
    currency: '{{ shop.currency }}',
    email: '{{ checkout.email }}'
  });
</script>
{% endif %}`,
  },
  {
    id: 'shopify-view-product',
    name: 'Shopify Product View',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'tiktok'],
    description: 'Track product page views with real Shopify product data',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['shopify', 'product', 'view'],
    fileName: 'shopify-product.liquid',
    previewCode: `<script>
  window.TrackHive.track('ViewContent', {
    value: {{ product.price | divided_by: 100.0 }},
    currency: '{{ shop.currency }}'
  });
</script>`,
  },
  {
    id: 'shopify-customer-data',
    name: 'Shopify Customer Data Sync',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'google'],
    description: 'Automatically include customer email in all events when logged in',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['shopify', 'customer', 'email'],
    fileName: 'shopify-customer.liquid',
    previewCode: `{% if customer %}
<script>
  // Auto-include customer data in all TrackHive events
  var _th_customer = {
    email: '{{ customer.email }}',
    phone: '{{ customer.phone }}'
  };
  window.addEventListener('load', function() {
    if (window.TrackHive) {
      window.TrackHive.customer = _th_customer;
    }
  });
</script>
{% endif %}`,
  },
  {
    id: 'shopify-full-setup',
    name: 'Shopify Complete TrackHive Setup',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Full TrackHive installation for Shopify — covers all events in one file',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['shopify', 'complete', 'setup'],
    fileName: 'shopify-complete.liquid',
    previewCode: `{% comment %} Add to theme.liquid before </head> {% endcomment %}
<script>window.TRACKHIVE_KEY = "YOUR_API_KEY";</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>
{% if customer %}
<script>window.TrackHive.customer = { email: '{{ customer.email }}' };</script>
{% endif %}`,
  },
  {
    id: 'shopify-search',
    name: 'Shopify Search Tracker',
    category: 'Shopify',
    type: 'shopify',
    platform: ['meta', 'google'],
    description: 'Track search on Shopify storefront',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['shopify', 'search'],
    fileName: 'shopify-search.liquid',
    previewCode: `<script>
  window.TrackHive.track('Search', {
    event_source_url: window.location.href
  });
</script>`,
  },
  // ============ WORDPRESS TEMPLATES ============
  {
    id: 'wp-purchase-woo',
    name: 'WooCommerce Purchase Tracker',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'google'],
    description: 'Track WooCommerce purchases on thank you page with real order data',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['wordpress', 'woocommerce', 'purchase'],
    fileName: 'wp-purchase.php',
    previewCode: `<?php
// Add to functions.php
add_action('woocommerce_thankyou', function($order_id) {
  $order = wc_get_order($order_id);
  $email = $order->get_billing_email();
  $total = $order->get_total();
  $currency = get_woocommerce_currency();
  ?>
  <script>
    window.TrackHive.track('Purchase', {
      value: <?php echo $total; ?>,
      currency: '<?php echo $currency; ?>',
      email: '<?php echo esc_js($email); ?>',
      event_id: '<?php echo $order_id; ?>'
    });
  </script>
  <?php
});`,
  },
  {
    id: 'wp-lead-cf7',
    name: 'Contact Form 7 Lead Tracker',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'google'],
    description: 'Track Contact Form 7 submissions as lead events',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['wordpress', 'cf7', 'lead', 'form'],
    fileName: 'wp-cf7.js',
    previewCode: `// Add via GTM or functions.php
document.addEventListener('wpcf7mailsent', function(event) {
  var email = event.detail.inputs.find(i => i.name === 'your-email');
  window.TrackHive.track('Lead', {
    email: email ? email.value : '',
    event_source_url: window.location.href
  });
});`,
  },
  {
    id: 'wp-add-to-cart-woo',
    name: 'WooCommerce Add to Cart',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'tiktok'],
    description: 'Track WooCommerce add to cart with AJAX support',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['wordpress', 'woocommerce', 'cart'],
    fileName: 'wp-cart.js',
    previewCode: `jQuery(document.body).on('added_to_cart', function(e, fragments, cart_hash, $button) {
  var price = $button.data('product_price') || 0;
  window.TrackHive.track('AddToCart', {
    value: price,
    currency: wc_cart_params.currency
  });
});`,
  },
  {
    id: 'wp-gravity-forms',
    name: 'Gravity Forms Lead Tracker',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'google'],
    description: 'Track Gravity Forms submissions as leads',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['wordpress', 'gravity', 'form', 'lead'],
    fileName: 'wp-gravity.js',
    previewCode: `jQuery(document).on('gform_confirmation_loaded', function(event, formId) {
  window.TrackHive.track('Lead', {
    event_source_url: window.location.href
  });
});`,
  },
  {
    id: 'wp-full-setup',
    name: 'WordPress Complete Setup',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Complete TrackHive WordPress installation via functions.php',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['wordpress', 'complete', 'setup'],
    fileName: 'wp-complete.php',
    previewCode: `<?php
// Add to functions.php
function trackhive_install() { ?>
  <script>window.TRACKHIVE_KEY = "YOUR_API_KEY";</script>
  <script src="https://track.itshassanahmed.com/th.js" async></script>
<?php }
add_action('wp_head', 'trackhive_install');`,
  },
  {
    id: 'wp-elementor-form',
    name: 'Elementor Form Lead Tracker',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'google'],
    description: 'Track Elementor form submissions as leads',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['wordpress', 'elementor', 'form', 'lead'],
    fileName: 'wp-elementor.js',
    previewCode: `jQuery(document).on('elementor/popup/show_listener', function() {
  // On form submit success
  window.TrackHive.track('Lead', { event_source_url: window.location.href });
});`,
  },
  {
    id: 'wp-woo-checkout',
    name: 'WooCommerce Checkout Tracker',
    category: 'WordPress',
    type: 'wordpress',
    platform: ['meta', 'google'],
    description: 'Track WooCommerce checkout page view',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['wordpress', 'woocommerce', 'checkout'],
    fileName: 'wp-checkout.php',
    previewCode: `<?php
add_action('woocommerce_before_checkout_form', function() {
  ?>
  <script>
    window.TrackHive.track('InitiateCheckout', {
      value: <?php echo WC()->cart->get_cart_total(); ?>,
      currency: '<?php echo get_woocommerce_currency(); ?>'
    });
  </script>
  <?php
});`,
  },
  // ============ WEBFLOW ============
  {
    id: 'webflow-purchase',
    name: 'Webflow E-commerce Purchase',
    category: 'Webflow',
    type: 'webflow',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track Webflow e-commerce purchase on thank you page',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['webflow', 'purchase', 'ecommerce'],
    fileName: 'webflow-purchase.html',
    previewCode: `<script>
  window.TrackHive.track('Purchase', {
    value: parseFloat(document.querySelector('[data-order-total]')?.textContent || 0),
    currency: 'USD',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'webflow-lead-form',
    name: 'Webflow Form Lead Tracker',
    category: 'Webflow',
    type: 'webflow',
    platform: ['meta', 'google'],
    description: 'Track Webflow form submissions as leads via custom code embed',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['webflow', 'form', 'lead'],
    fileName: 'webflow-lead.html',
    previewCode: `<script>
  document.querySelector('form').addEventListener('submit', function() {
    var email = document.querySelector('input[type="email"]')?.value || '';
    window.TrackHive.track('Lead', { email: email, event_source_url: window.location.href });
  });
</script>`,
  },
  {
    id: 'webflow-full-snippet',
    name: 'Webflow TrackHive Snippet',
    category: 'Webflow',
    type: 'webflow',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Add TrackHive to Webflow via Custom Code in site settings',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['webflow', 'snippet', 'setup'],
    fileName: 'webflow-snippet.html',
    previewCode: `<!-- Paste in Webflow Project Settings > Custom Code > Head -->
<script>window.TRACKHIVE_KEY = "YOUR_API_KEY";</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>`,
  },
  // ============ HTML / GENERIC ============
  {
    id: 'html-purchase',
    name: 'HTML/JS Purchase Snippet',
    category: 'HTML',
    type: 'html',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Generic purchase tracking for custom HTML/JS sites',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['html', 'purchase', 'snippet'],
    fileName: 'html-purchase.html',
    previewCode: `<script>
  window.TrackHive.track('Purchase', {
    value: 99.00,
    currency: 'USD',
    email: 'customer@example.com',
    event_id: 'ORDER_123',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'html-lead',
    name: 'HTML/JS Lead Snippet',
    category: 'HTML',
    type: 'html',
    platform: ['meta', 'google'],
    description: 'Generic lead tracking for custom sites',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['html', 'lead', 'snippet'],
    fileName: 'html-lead.html',
    previewCode: `<script>
  window.TrackHive.track('Lead', {
    email: 'lead@example.com',
    event_source_url: window.location.href
  });
</script>`,
  },
  // ============ sGTM TEMPLATES ============
  {
    id: 'sgtm-meta-capi',
    name: 'sGTM Meta CAPI Tag',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['meta'],
    description: 'Server-side GTM tag that forwards events to Meta CAPI with full user data',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['sgtm', 'meta', 'server', 'capi'],
    fileName: 'sgtm-meta-capi.tpl',
    previewCode: `// sGTM Tag Template — Meta CAPI
// Import this .tpl file into your sGTM container
// Fields: Pixel ID, Access Token (from your TrackHive dashboard)

const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getAllEventData = require('getAllEventData');
const sha256 = require('sha256');

const eventData = getAllEventData();
const pixelId = data.pixelId;
const accessToken = data.accessToken;

const payload = {
  data: [{
    event_name: eventData.event_name || 'PageView',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventData.transaction_id || eventData.event_id,
    event_source_url: eventData.page_location,
    action_source: 'website',
    user_data: {
      client_ip_address: eventData.ip_override,
      client_user_agent: eventData.user_agent,
      em: eventData.email ? sha256(eventData.email.toLowerCase().trim()) : undefined
    },
    custom_data: {
      value: eventData.value,
      currency: eventData.currency || 'USD'
    }
  }]
};

sendHttpRequest(
  'https://graph.facebook.com/v19.0/' + pixelId + '/events?access_token=' + accessToken,
  { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) },
  data.gtmOnSuccess,
  data.gtmOnFailure
);`,
  },
  {
    id: 'sgtm-google-enhanced',
    name: 'sGTM Google Enhanced Conversions',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['google'],
    description: 'sGTM tag for Google Ads Enhanced Conversions with automatic PII hashing',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['sgtm', 'google', 'enhanced', 'conversions'],
    fileName: 'sgtm-google-ec.tpl',
    previewCode: `// sGTM Tag Template — Google Enhanced Conversions
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getAllEventData = require('getAllEventData');
const sha256 = require('sha256');

const eventData = getAllEventData();

const payload = {
  client_id: eventData.client_id,
  events: [{
    name: 'purchase',
    params: {
      value: eventData.value,
      currency: eventData.currency || 'USD',
      transaction_id: eventData.transaction_id
    }
  }],
  user_data: {
    email_address: eventData.email ? sha256(eventData.email) : undefined,
    phone_number: eventData.phone ? sha256(eventData.phone) : undefined
  }
};`,
  },
  {
    id: 'sgtm-tiktok',
    name: 'sGTM TikTok Events API',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['tiktok'],
    description: 'Server-side GTM tag for TikTok Events API',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['sgtm', 'tiktok', 'events'],
    fileName: 'sgtm-tiktok.tpl',
    previewCode: `// sGTM Tag Template — TikTok Events API
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getAllEventData = require('getAllEventData');

const eventData = getAllEventData();
const pixelCode = data.pixelCode;
const accessToken = data.accessToken;

const payload = {
  pixel_code: pixelCode,
  event: data.eventName || 'Pageview',
  event_time: Math.floor(Date.now() / 1000),
  user: {
    ip: eventData.ip_override,
    user_agent: eventData.user_agent
  },
  properties: {
    value: eventData.value,
    currency: eventData.currency || 'USD'
  }
};

sendHttpRequest(
  'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
  { method: 'POST', headers: {'Access-Token': accessToken, 'Content-Type':'application/json'}, body: JSON.stringify(payload) },
  data.gtmOnSuccess,
  data.gtmOnFailure
);`,
  },
  {
    id: 'sgtm-trackhive',
    name: 'sGTM TrackHive Forwarder',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['meta', 'google', 'tiktok', 'snapchat'],
    description: 'Forward all sGTM events to TrackHive — handles all platforms automatically',
    difficulty: 'intermediate',
    requiredPlan: 'agency',
    tags: ['sgtm', 'trackhive', 'all-platforms'],
    fileName: 'sgtm-trackhive.tpl',
    previewCode: `// sGTM Tag Template — TrackHive Universal Forwarder
// Forwards to ALL platforms via TrackHive
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getAllEventData = require('getAllEventData');

const eventData = getAllEventData();

const payload = {
  api_key: data.apiKey,
  event_name: eventData.event_name || data.eventName,
  value: eventData.value,
  currency: eventData.currency || 'USD',
  email: eventData.email,
  event_id: eventData.transaction_id,
  event_source_url: eventData.page_location
};

sendHttpRequest(
  'https://track.itshassanahmed.com/api/event',
  { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) },
  data.gtmOnSuccess,
  data.gtmOnFailure
);`,
  },
  {
    id: 'sgtm-deduplication',
    name: 'sGTM Event Deduplicator',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['meta', 'google'],
    description: 'Prevent duplicate events between browser and server using event_id matching',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['sgtm', 'deduplication', 'event_id'],
    fileName: 'sgtm-dedup.tpl',
    previewCode: `// sGTM Deduplication Variable Template
// Generates consistent event_id for browser + server matching
const getAllEventData = require('getAllEventData');
const eventData = getAllEventData();

// Use transaction_id if available (purchases)
// Otherwise use client_id + timestamp for consistency
const eventId = eventData.transaction_id ||
  (eventData.client_id + '_' + eventData.event_name + '_' + Math.floor(Date.now()/1000));

return eventId;`,
  },
  {
    id: 'sgtm-snapchat',
    name: 'sGTM Snapchat CAPI Tag',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['snapchat'],
    description: 'Server-side GTM tag for Snapchat Conversions API',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['sgtm', 'snapchat', 'capi'],
    fileName: 'sgtm-snapchat.tpl',
    previewCode: `// sGTM Tag Template — Snapchat CAPI
const sendHttpRequest = require('sendHttpRequest');
const JSON = require('JSON');
const getAllEventData = require('getAllEventData');

const eventData = getAllEventData();
const payload = {
  event_type: 'PURCHASE',
  hashed_email: eventData.email ? sha256(eventData.email) : undefined,
  price: eventData.value,
  currency: eventData.currency || 'USD'
};
// POST to Snapchat CAPI endpoint
sendHttpRequest(url, { method: 'POST', body: JSON.stringify(payload) }, data.gtmOnSuccess, data.gtmOnFailure);`,
  },
  {
    id: 'sgtm-ga4',
    name: 'sGTM GA4 Measurement Protocol',
    category: 'Server GTM',
    type: 'sgtm',
    platform: ['ga4'],
    description: 'Send server-side events to GA4 via Measurement Protocol',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['sgtm', 'ga4', 'measurement'],
    fileName: 'sgtm-ga4.tpl',
    previewCode: `// sGTM — GA4 Measurement Protocol
const sendHttpRequest = require('sendHttpRequest');
const getAllEventData = require('getAllEventData');
const payload = {
  client_id: eventData.client_id,
  events: [{ name: eventData.event_name || 'purchase', params: { value: eventData.value, currency: eventData.currency } }]
};
sendHttpRequest('https://www.google-analytics.com/mp/collect?measurement_id=' + data.measurementId + '&api_secret=' + data.apiSecret, { method: 'POST', body: JSON.stringify(payload) }, data.gtmOnSuccess, data.gtmOnFailure);`,
  },
  // ============ GTM .TPL FILES ============
  {
    id: 'tpl-trackhive-web',
    name: 'TrackHive Web GTM Template (.tpl)',
    category: 'GTM Import Files',
    type: 'gtm-tpl',
    platform: ['meta', 'google', 'tiktok', 'snapchat'],
    description: 'Import this .tpl file into GTM — creates TrackHive tag type in your container. Fill in API key and event name.',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['tpl', 'import', 'gtm', 'template'],
    fileName: 'trackhive-web.tpl',
    previewCode: `// After importing this .tpl into GTM:
// 1. Create new tag → choose TrackHive
// 2. Enter your API key
// 3. Choose event name
// 4. Map variables (order value, email etc)
// 5. Set your trigger
// 6. Publish
// That is all — TrackHive handles the rest`,
  },
  {
    id: 'tpl-trackhive-sgtm',
    name: 'TrackHive sGTM Template (.tpl)',
    category: 'GTM Import Files',
    type: 'gtm-tpl',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Import into your SERVER-SIDE GTM container for full server-side tracking',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['tpl', 'sgtm', 'server', 'import'],
    fileName: 'trackhive-sgtm.tpl',
    previewCode: `// Server-side GTM template
// Import into your sGTM container
// Requires: sGTM container on Google Cloud`,
  },
  {
    id: 'gtm-cart-view',
    name: 'Cart View Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track when users view their cart',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['cart', 'view', 'ecommerce'],
    fileName: 'gtm-cart-view.json',
    previewCode: `<script>
  window.TrackHive.track('ViewCart', {
    value: {{Cart Total}},
    currency: '{{Currency}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-product-list-view',
    name: 'Product List Impression Tracker',
    category: 'E-commerce',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track product list/catalog impressions for dynamic ads',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['product', 'list', 'catalog', 'ecommerce'],
    fileName: 'gtm-product-list.json',
    previewCode: `<script>
  window.TrackHive.track('ViewItemList', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-login',
    name: 'Login Event Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track user login for authenticated user matching',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['login', 'auth', 'user'],
    fileName: 'gtm-login.json',
    previewCode: `<script>
  window.TrackHive.track('Login', {
    email: '{{User Email}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-signup',
    name: 'Sign Up Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google', 'tiktok'],
    description: 'Track account sign up with optional method (email/social)',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['signup', 'registration', 'lead'],
    fileName: 'gtm-signup.json',
    previewCode: `<script>
  window.TrackHive.track('CompleteRegistration', {
    email: '{{User Email}}',
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-apply-now',
    name: 'Apply Now / Application Tracker',
    category: 'Lead Generation',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track job or application form submissions',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['apply', 'application', 'lead'],
    fileName: 'gtm-apply.json',
    previewCode: `<script>
  window.TrackHive.track('SubmitApplication', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-blog-read',
    name: 'Blog/Article Read Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google', 'ga4'],
    description: 'Track blog or article page views for content performance',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['blog', 'content', 'engagement'],
    fileName: 'gtm-blog.json',
    previewCode: `<script>
  window.TrackHive.track('BlogRead', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-tool-calculator',
    name: 'Calculator / Tool Use Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track when users use calculators or interactive tools',
    difficulty: 'intermediate',
    requiredPlan: 'free',
    tags: ['calculator', 'tool', 'engagement'],
    fileName: 'gtm-calculator.json',
    previewCode: `<script>
  window.TrackHive.track('ToolUse', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-gallery-view',
    name: 'Gallery / Image View Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google'],
    description: 'Track gallery or lightbox image views',
    difficulty: 'beginner',
    requiredPlan: 'free',
    tags: ['gallery', 'image', 'engagement'],
    fileName: 'gtm-gallery.json',
    previewCode: `<script>
  window.TrackHive.track('GalleryView', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'gtm-consent-granted',
    name: 'Consent Granted Tracker',
    category: 'Engagement',
    type: 'gtm-web',
    platform: ['meta', 'google', 'ga4'],
    description: 'Track when user accepts cookie/marketing consent',
    difficulty: 'intermediate',
    requiredPlan: 'pro',
    tags: ['consent', 'gdpr', 'privacy'],
    fileName: 'gtm-consent.json',
    previewCode: `<script>
  window.TrackHive.track('ConsentGranted', {
    event_source_url: window.location.href
  });
</script>`,
  },
  {
    id: 'tpl-meta-capi',
    name: 'Meta CAPI GTM Template (.tpl)',
    category: 'GTM Import Files',
    type: 'gtm-tpl',
    platform: ['meta'],
    description: 'Import into sGTM for Meta Conversions API server-side tag',
    difficulty: 'advanced',
    requiredPlan: 'agency',
    tags: ['tpl', 'meta', 'capi', 'sgtm'],
    fileName: 'meta-capi.tpl',
    previewCode: `// sGTM Meta CAPI .tpl
// Import into Server container for Meta server-side events`,
  },
]

export const CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))].sort()
export const PLATFORMS = ['meta', 'google', 'tiktok', 'snapchat', 'ga4', 'linkedin'] as const
export const TYPES: { value: Template['type']; label: string }[] = [
  { value: 'gtm-web', label: 'GTM Web' },
  { value: 'gtm-tpl', label: 'GTM .tpl Files' },
  { value: 'sgtm', label: 'sGTM' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'html', label: 'HTML' },
]
