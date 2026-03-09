/**
 * Seed script: inserts blog posts and pSEO pages into Supabase via admin client.
 * Run: npx ts-node --project tsconfig.json src/scripts/seed-seo-content.ts
 * Or:  npx ts-node -e "require('dotenv').config({ path: '.env.local' })" src/scripts/seed-seo-content.ts
 */
import { createClient } from '@supabase/supabase-js'

;(async () => {
  const dotenv = await import('dotenv')
  dotenv.config({ path: '.env.local' })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Load .env.local (e.g. run with dotenv).')
    process.exit(1)
  }
  const supabaseAdmin = createClient(url, key)

const BLOG_POSTS = [
  {
    title: 'How to Fix iOS 14 Tracking Loss on Facebook Ads',
    slug: 'how-to-fix-ios14-tracking-loss-facebook-ads',
    meta_title: 'How to Fix iOS 14 Tracking Loss on Facebook Ads — TrackHive',
    meta_description: 'iOS 14 killed up to 40% of Facebook ad conversions. Here is exactly how to fix iOS 14 tracking loss using server-side tracking and Meta CAPI.',
    primary_keyword: 'ios 14 tracking loss facebook ads',
    excerpt: 'iOS 14 killed up to 40% of Facebook ad conversions overnight. Here is the exact fix using Meta Conversions API and server-side tracking.',
    content: `
# How to Fix iOS 14 Tracking Loss on Facebook Ads

iOS 14 changed everything for Facebook advertisers. When Apple released its App Tracking Transparency (ATT) framework, it gave users the option to block cross-app tracking — and the majority of them did. The result was a 40-60% drop in reported conversions for advertisers relying on the browser-based Facebook Pixel.

If your Facebook ad costs went up and your reported ROAS went down after 2021, iOS 14 is almost certainly the reason.

## Why iOS 14 Broke Facebook Tracking

The Facebook Pixel is a JavaScript snippet that runs in the browser. When a user on an iPhone blocks tracking, the browser refuses to load or fire that pixel. The conversion happens — the purchase is made, the lead is submitted — but Facebook never sees it.

This creates two problems:
- **Underreported conversions** — Facebook thinks your ads are performing worse than they actually are
- **Poor optimization** — The algorithm cannot optimize for conversions it cannot see, so it starts targeting the wrong people

According to [Meta's own documentation](https://developers.facebook.com/docs/marketing-api/conversions-api), advertisers using only browser-side pixels can lose up to 40% of measurable conversion events due to browser restrictions.

## The Fix: Meta Conversions API (Server-Side Tracking)

The only permanent fix for iOS 14 tracking loss is **Meta Conversions API (CAPI)** — server-side event tracking that sends conversion data directly from your server to Meta, bypassing the browser entirely.

Because the event never touches the user's browser, ad blockers, iOS privacy settings and Safari ITP cannot interfere.

Here is what changes with server-side tracking:

| Browser Pixel | Server-Side (Meta CAPI) |
|---|---|
| Blocked by iOS 14 | Bypasses iOS 14 completely |
| Blocked by ad blockers | Ad blockers cannot interfere |
| 50-60% match rate | 85-90%+ match rate |
| Cookie expires in 7 days | Server cookies last 180 days |

## How to Set Up Meta CAPI in 5 Minutes with TrackHive

TrackHive is a server-side tracking tool that connects your website to Meta Conversions API without any developer work or complex infrastructure.

Here is how to get started:

1. **Create a free TrackHive account** at [track.itshassanahmed.com](https://track.itshassanahmed.com/dashboard/signup)
2. **Add your Meta Pixel ID and access token** in the Pixels section
3. **Paste one script tag** on your website
4. **Verify events are firing** in the TrackHive live stream dashboard

Most users are live with server-side Meta CAPI in under 5 minutes.

## What Match Rate Should You Expect?

With browser-only tracking, most advertisers see a 50-60% match rate on Meta. With TrackHive server-side tracking, users consistently achieve 85-90%+ match rates because TrackHive automatically captures and sends:

- Email address (hashed)
- Phone number (hashed)
- First and last name
- fbp and fbc cookie values
- fbclid from URL parameters
- IP address and user agent

All of this enriched data is sent with every event, giving Meta the best possible chance to match the event to a real user account.

## Deduplication — Avoiding Double Counting

If you run both the browser pixel and server-side CAPI simultaneously (which you should, for redundancy), you need deduplication. TrackHive handles this automatically by sending a matching event_id with both the browser and server event so Meta counts it only once.

## Summary

iOS 14 is not going away and Apple continues to tighten privacy restrictions with every new release. The only sustainable solution is server-side tracking via Meta Conversions API.

TrackHive makes this setup take 5 minutes instead of 5 days. [Start free today](https://track.itshassanahmed.com/dashboard/signup) — no credit card required.

**Related reading:**
- [How to Improve Meta Match Rate Above 90%](/blog/how-to-improve-meta-match-rate)
- [Meta CAPI Integration Guide](/integrations/meta-capi)
- [Server-Side Tracking vs Client-Side Tracking](/blog/server-side-vs-client-side-tracking)
    `,
    published: true,
    author: 'TrackHive Team',
    category: 'Facebook Ads',
    tags: ['ios14', 'meta capi', 'facebook ads', 'server-side tracking', 'conversion tracking'],
    read_time: 6,
  },
  {
    title: 'Meta CAPI vs Facebook Pixel — What is the Difference',
    slug: 'meta-capi-vs-facebook-pixel-difference',
    meta_title: 'Meta CAPI vs Facebook Pixel — What is the Difference? | TrackHive',
    meta_description: 'Meta CAPI and Facebook Pixel both track conversions but work completely differently. Learn which one you need and why most advertisers should use both.',
    primary_keyword: 'meta capi vs facebook pixel',
    excerpt: 'Meta CAPI and the Facebook Pixel both track conversions — but they work in completely opposite ways. Here is what every advertiser needs to know.',
    content: `
# Meta CAPI vs Facebook Pixel — What is the Difference

If you run Facebook or Instagram ads, you have heard of the Facebook Pixel. But Meta Conversions API (CAPI) is newer and less understood. Many advertisers are not sure if they need both, one or the other.

This guide explains exactly how each works, what they track and why most serious advertisers should be using both.

## What is the Facebook Pixel?

The Facebook Pixel is a JavaScript snippet you paste into your website's HTML. When a visitor loads your page, their browser downloads and executes this script, which fires events — PageView, AddToCart, Purchase — back to Facebook.

The pixel works entirely in the **browser** (client-side). This means it is subject to every browser restriction:

- **Ad blockers** block the pixel script from loading
- **iOS 14 ATT** prevents cross-site tracking on iPhones
- **Safari ITP** deletes first-party cookies within 1-7 days
- **Firefox ETP** blocks tracking scripts by default

The result is that browser pixels typically report only 55-70% of actual conversions.

## What is Meta Conversions API (CAPI)?

Meta Conversions API is a **server-side** tracking method. Instead of the browser firing events to Meta, your server sends the events directly via Meta's API.

Because it runs on your server — not in the user's browser — no ad blocker, iOS setting or browser restriction can interfere.

According to [Meta's business help documentation](https://www.facebook.com/business/help/meta-conversions-api), the Conversions API is designed to create a direct and reliable connection between your marketing data and Meta.

## Side-by-Side Comparison

| Feature | Facebook Pixel | Meta CAPI |
|---|---|---|
| Where it runs | Browser (client-side) | Server (server-side) |
| Blocked by ad blockers | Yes | No |
| Affected by iOS 14 | Yes | No |
| Typical match rate | 50-65% | 85-95% |
| Setup complexity | Paste script tag | Requires server setup |
| Cookie tracking | 7-day limit (Safari) | 180+ days possible |
| Real-time data | Yes | Yes |

## Should You Use Both?

Yes. Meta recommends running both the pixel and CAPI simultaneously for redundancy and maximum coverage. When both are active:

- The pixel catches events that the server misses (rare)
- CAPI catches everything the pixel misses (common)
- Deduplication ensures events are not double counted

This is called a **redundant setup** and it is the industry best practice for performance advertisers.

## How TrackHive Makes This Easy

Setting up Meta CAPI traditionally requires a developer, server infrastructure and ongoing maintenance. TrackHive removes all of that complexity.

With TrackHive you get:
- Browser pixel fires automatically via the script tag
- Server-side CAPI fires simultaneously from TrackHive's infrastructure
- Automatic deduplication so events are never double counted
- 90%+ match rates out of the box

[Connect Meta CAPI with TrackHive](/integrations/meta-capi) in under 5 minutes.

## Summary

The Facebook Pixel is essential but unreliable on its own. Meta CAPI is the permanent fix for the data loss problem. Running both together with proper deduplication is the correct setup for any advertiser spending more than a few hundred dollars per month on Facebook and Instagram ads.

[Start free with TrackHive](https://track.itshassanahmed.com/dashboard/signup) and get both running today.

**Related reading:**
- [How to Fix iOS 14 Tracking Loss on Facebook Ads](/blog/how-to-fix-ios14-tracking-loss-facebook-ads)
- [How to Improve Meta Match Rate Above 90%](/blog/how-to-improve-meta-match-rate)
- [Meta CAPI Integration Guide](/integrations/meta-capi)
    `,
    published: true,
    author: 'TrackHive Team',
    category: 'Facebook Ads',
    tags: ['meta capi', 'facebook pixel', 'server-side tracking', 'conversion tracking'],
    read_time: 5,
  },
  {
    title: 'How to Improve Meta Match Rate Above 90%',
    slug: 'how-to-improve-meta-match-rate',
    meta_title: 'How to Improve Meta Match Rate Above 90% | TrackHive',
    meta_description: 'Meta match rate below 70%? Here is exactly how to improve your Meta Conversions API match rate above 90% by sending the right customer data.',
    primary_keyword: 'improve meta match rate',
    excerpt: 'Most advertisers see 50-70% match rates on Meta. Here is exactly what data to send to push yours above 90% and what that means for your ROAS.',
    content: `
# How to Improve Meta Match Rate Above 90%

Meta match rate is one of the most important — and most ignored — metrics in Facebook advertising. It measures how often Meta can match a conversion event you send to an actual Facebook or Instagram user account.

A higher match rate means better optimization, lower CPL and higher ROAS. Most advertisers are leaving this on the table.

## What is Meta Match Rate?

When you send a conversion event to Meta via the Conversions API, Meta tries to match that event to a user in its system. It uses the customer data you send — email, phone, name, location — to find the matching user account.

If Meta finds a match, it can:
- Attribute the conversion to the correct ad
- Use the conversion to optimize future targeting
- Build lookalike audiences from converters

If Meta cannot find a match, the event is essentially wasted for optimization purposes.

## What is a Good Match Rate?

According to Meta's Events Manager benchmarks:
- **Below 60%** — Poor. Significant data loss
- **60-79%** — Average. Room for improvement
- **80-89%** — Good. Above industry average
- **90%+** — Excellent. Maximum optimization signal

Most advertisers running browser-only pixels see 50-65%. Server-side setups without full data enrichment typically see 65-80%. With proper enrichment, 90%+ is achievable.

## What Data Improves Match Rate?

Meta uses the following customer information parameters (CIPs) to match events. Sending more of them improves your match rate:

| Parameter | Impact | Notes |
|---|---|---|
| Email (em) | Very High | Hash with SHA-256 |
| Phone (ph) | Very High | Include country code |
| First name (fn) | High | Hash with SHA-256 |
| Last name (ln) | High | Hash with SHA-256 |
| fbp cookie | High | Capture from browser |
| fbc cookie | High | Capture from fbclid URL param |
| City (ct) | Medium | From billing or IP |
| Country (country) | Medium | Two-letter code |
| Zip code (zp) | Medium | Postal code |
| Date of birth (db) | Low | If available |

The single biggest lever is sending **both email and phone together**. Meta's internal research shows that events with both email and phone match at significantly higher rates than events with email alone.

## How TrackHive Maximizes Your Match Rate

TrackHive automatically captures and sends all available customer data parameters with every event:

1. **fbp and fbc** — captured automatically from browser cookies
2. **fbclid** — extracted from URL parameters when users click Facebook ads
3. **Email and phone** — captured from form submissions and checkout events
4. **IP address and user agent** — sent with every event for additional matching
5. **Name and location** — captured from checkout and lead forms

All data is hashed with SHA-256 before transmission, meeting Meta's privacy requirements.

TrackHive users consistently achieve 85-92% match rates. [See how it works](/integrations/meta-capi).

## Step-by-Step: Improving Your Match Rate Today

**Step 1 — Switch to server-side tracking**
Browser pixels cannot capture fbp and fbc reliably after iOS 14. Server-side tracking via TrackHive fixes this immediately.

**Step 2 — Capture email at every touchpoint**
Make sure every lead form, checkout and signup sends the email parameter. This alone can move match rate from 60% to 80%.

**Step 3 — Add phone number fields to your forms**
Combine email with phone for the highest match rate. Even optional phone fields improve your dataset.

**Step 4 — Preserve fbclid in your URLs**
When users click your Facebook ads, Meta appends fbclid to the URL. Make sure your website preserves this parameter and TrackHive captures it.

**Step 5 — Check your Events Manager weekly**
Monitor your match rate in Meta Events Manager under the Data Sources section. Set a target of 85% and work toward 90%.

## Summary

A 90%+ match rate is achievable for any advertiser with the right setup. The key is sending enriched customer data — especially email, phone, fbp and fbc — with every server-side event.

TrackHive automates all of this. [Start free today](https://track.itshassanahmed.com/dashboard/signup).

**Related reading:**
- [Meta CAPI vs Facebook Pixel — What is the Difference](/blog/meta-capi-vs-facebook-pixel-difference)
- [How to Fix iOS 14 Tracking Loss](/blog/how-to-fix-ios14-tracking-loss-facebook-ads)
- [Meta CAPI Integration Guide](/integrations/meta-capi)
    `,
    published: true,
    author: 'TrackHive Team',
    category: 'Conversion Tracking',
    tags: ['meta match rate', 'meta capi', 'conversion tracking', 'facebook ads optimization'],
    read_time: 7,
  },
  {
    title: 'Server-Side Tracking vs Client-Side Tracking',
    slug: 'server-side-vs-client-side-tracking',
    meta_title: 'Server-Side Tracking vs Client-Side Tracking — Full Comparison | TrackHive',
    meta_description: 'Server-side vs client-side tracking — understand the key differences, when to use each and why server-side is now the industry standard for performance advertisers.',
    primary_keyword: 'server-side tracking vs client-side tracking',
    excerpt: 'Client-side tracking is dying. Server-side tracking is the new standard. Here is a complete breakdown of how they differ and why it matters for your ad spend.',
    content: `
# Server-Side Tracking vs Client-Side Tracking

If you run paid ads on Meta, TikTok or Google, the way your conversions are tracked directly affects how much you pay per lead and how accurately your campaigns optimize. Most advertisers are still using client-side tracking — and losing 30-40% of their conversion data because of it.

Here is everything you need to know about the difference between server-side and client-side tracking.

## What is Client-Side Tracking?

Client-side tracking means the tracking code runs in the **user's browser**. When a visitor lands on your page, their browser downloads JavaScript files — the Facebook Pixel, Google Tag Manager, TikTok Pixel — and those scripts fire events back to the advertising platforms.

This is how 90% of websites are still set up today.

### Problems with Client-Side Tracking

Browser-based tracking has serious and growing limitations:

- **Ad blockers** — uBlock Origin, AdBlock Plus and others block tracking scripts from loading entirely. Over 40% of desktop users have ad blockers installed according to [Statista](https://www.statista.com/statistics/804008/ad-blocking-reach-usage-us/)
- **iOS 14+ ATT** — Apple's App Tracking Transparency prompts users to block cross-app tracking. The majority opt out
- **Safari ITP (Intelligent Tracking Prevention)** — deletes first-party cookies within 1-7 days, breaking attribution for returning visitors
- **Firefox Enhanced Tracking Protection** — blocks known tracking domains by default
- **Browser crashes and slow connections** — the pixel script may not finish loading before the user leaves

The result: client-side tracking typically captures only 55-70% of actual conversions.

## What is Server-Side Tracking?

Server-side tracking moves the tracking logic from the user's browser to **your server** (or a tracking infrastructure like TrackHive). Instead of the browser firing events to Meta or Google, your server sends them directly via API.

The user's browser is never involved in the event transmission. Ad blockers, iOS settings and browser restrictions have zero effect.

### Advantages of Server-Side Tracking

- **97%+ delivery rate** — events go directly from server to platform
- **90%+ match rate** — more customer data can be sent and enriched
- **180-day cookie lifetime** — server-side cookies are not subject to ITP
- **Better data quality** — IP address, user agent and server-side enrichment
- **First-party data** — you own and control the data

## Side-by-Side Comparison

| Factor | Client-Side | Server-Side |
|---|---|---|
| Where code runs | User's browser | Your server |
| Ad blocker impact | Blocked frequently | No impact |
| iOS 14 impact | Significant data loss | No impact |
| Cookie lifetime | 1-7 days (Safari) | 180+ days |
| Typical match rate | 50-65% | 85-95% |
| Setup complexity | Easy (paste script) | Requires infrastructure |
| Data ownership | Shared with browser | You own it |
| Latency | Low | Very low |

## Do You Need to Choose One or the Other?

No. The best practice is to run **both simultaneously**:

1. Keep your browser pixel for real-time data and easy setup
2. Add server-side tracking for reliability and coverage
3. Use deduplication to prevent double counting

This redundant setup ensures maximum coverage — the server catches everything the browser misses, and the browser provides backup for any server-side gaps.

## How to Switch to Server-Side Tracking

Traditionally, server-side tracking required DevOps knowledge, cloud infrastructure and weeks of development time. Tools like TrackHive change this.

TrackHive provides server-side tracking infrastructure for Meta CAPI, TikTok Events API, Google Enhanced Conversions and GA4 — set up with a single script tag in under 5 minutes.

[Start free with TrackHive](https://track.itshassanahmed.com/dashboard/signup) — no developer or server setup required.

## Summary

Client-side tracking is becoming increasingly unreliable as browser privacy restrictions tighten. Server-side tracking is not the future — it is the present standard for any advertiser serious about data accuracy and campaign performance.

**Related reading:**
- [How to Fix iOS 14 Tracking Loss](/blog/how-to-fix-ios14-tracking-loss-facebook-ads)
- [Meta CAPI vs Facebook Pixel](/blog/meta-capi-vs-facebook-pixel-difference)
- [How to Set Up TikTok Events API](/blog/how-to-setup-tiktok-events-api-without-developer)
    `,
    published: true,
    author: 'TrackHive Team',
    category: 'Tracking & Analytics',
    tags: ['server-side tracking', 'client-side tracking', 'conversion tracking', 'meta capi', 'ad tracking'],
    read_time: 8,
  },
  {
    title: 'How to Set Up TikTok Events API Without a Developer',
    slug: 'how-to-setup-tiktok-events-api-without-developer',
    meta_title: 'How to Set Up TikTok Events API Without a Developer | TrackHive',
    meta_description: 'Set up TikTok Events API server-side tracking without any coding or developer help. This step-by-step guide shows you how to do it in under 10 minutes.',
    primary_keyword: 'tiktok events api setup without developer',
    excerpt: 'TikTok Events API gives you server-side conversion tracking that bypasses ad blockers and iOS restrictions. Here is how to set it up in minutes without any coding.',
    content: `
# How to Set Up TikTok Events API Without a Developer

TikTok ads are one of the fastest growing channels for ecommerce and lead generation. But like Facebook before it, TikTok's browser-based pixel is vulnerable to ad blockers, iOS 14 privacy settings and cookie restrictions.

The fix is TikTok Events API — TikTok's server-side tracking solution. And despite what you may have heard, you do not need a developer to set it up.

## What is TikTok Events API?

TikTok Events API (also called TikTok CAPI) is a server-to-server integration that sends conversion events directly from your server to TikTok's advertising platform — bypassing the browser entirely.

According to [TikTok's official documentation](https://ads.tiktok.com/marketing_api/docs?id=1741601162187777), the Events API is designed to improve data accuracy and help advertisers maintain tracking reliability regardless of browser restrictions.

Benefits of TikTok Events API:
- Conversions are not lost to ad blockers
- iOS 14 ATT prompt does not affect server-side events
- Better match rates for optimization
- More complete attribution data

## Why Most Advertisers Have Not Set It Up

The official TikTok Events API setup requires:
- A server or cloud function to receive and forward events
- Developer knowledge to write the API integration
- Ongoing maintenance if TikTok updates their API

This is why most small and medium advertisers skip it — even though it directly impacts their campaign performance.

## How to Set Up TikTok Events API in 5 Minutes with TrackHive

TrackHive connects your website to TikTok Events API without any coding, server setup or developer work.

**Step 1 — Create your TrackHive account**

Go to [track.itshassanahmed.com/dashboard/signup](https://track.itshassanahmed.com/dashboard/signup) and create a free account. The free plan gives you Meta CAPI. Upgrade to Pro for TikTok Events API.

**Step 2 — Get your TikTok Pixel ID and Access Token**

In TikTok Ads Manager:
1. Go to Assets → Events
2. Click your Pixel name
3. Copy the Pixel ID from the overview page
4. Go to Settings → Generate Access Token
5. Copy the access token

**Step 3 — Add TikTok pixel in TrackHive**

In your TrackHive dashboard:
1. Go to Pixels → Add New Pixel
2. Select TikTok Events API as the platform
3. Enter your Pixel ID and Access Token
4. Click Add Pixel

**Step 4 — Add the TrackHive script to your website**

If you have not already added the TrackHive script tag, go to Setup in your dashboard and copy the script. Paste it before the closing body tag on your website.

**Step 5 — Verify events are firing**

Go to the Live Stream section in TrackHive and visit your website in another tab. You should see PageView events appearing in real time. In TikTok Ads Manager under Events, you will see server events arriving within a few minutes.

## TikTok Events API Deduplication

If you run both the TikTok browser pixel and TikTok Events API simultaneously, you need deduplication to prevent double counting. TrackHive handles this automatically by passing a matching event_id with both the browser and server events.

## Which Events Should You Track?

For ecommerce:
- PageView, ViewContent, AddToCart, InitiateCheckout, Purchase

For lead generation:
- PageView, ViewContent, Contact, SubmitForm, CompleteRegistration

TrackHive lets you enable and disable individual events from the dashboard based on your business type.

## Summary

TikTok Events API is no longer optional for serious TikTok advertisers. Browser pixels miss too much data. Setting it up used to require a developer — with TrackHive it takes under 5 minutes.

[Start free and add TikTok Events API today](https://track.itshassanahmed.com/dashboard/signup).

**Related reading:**
- [Server-Side Tracking vs Client-Side Tracking](/blog/server-side-vs-client-side-tracking)
- [TikTok Events API Integration Guide](/integrations/tiktok-events-api)
- [How to Fix iOS 14 Tracking Loss](/blog/how-to-fix-ios14-tracking-loss-facebook-ads)
    `,
    published: true,
    author: 'TrackHive Team',
    category: 'TikTok Ads',
    tags: ['tiktok events api', 'tiktok capi', 'server-side tracking', 'tiktok ads', 'conversion tracking'],
    read_time: 6,
  },
]

const PSEO_PAGES = [
  // INTEGRATION PAGES
  {
    type: 'integration',
    slug: 'meta-capi',
    title: 'Meta CAPI Server-Side Tracking',
    meta_title: 'Meta Conversions API Integration — TrackHive',
    meta_description: 'Connect Meta Conversions API in 5 minutes. Send server-side events with 90%+ match rate. Bypass ad blockers and iOS 14 restrictions permanently.',
    h1: 'Meta CAPI Server-Side Tracking',
    hero_subtitle: 'Send Facebook and Instagram conversion events directly from your server. Bypass ad blockers, fix iOS 14 tracking loss and achieve 90%+ match rates.',
    platform_name: 'Meta CAPI',
    stat_1_number: '90%+',
    stat_1_label: 'Average match rate',
    stat_2_number: '5 min',
    stat_2_label: 'Setup time',
    stat_3_number: '97%',
    stat_3_label: 'Event delivery rate',
    section_1_title: 'Why Your Facebook Pixel is Losing Conversions',
    section_1_body: 'The Facebook Pixel runs in the browser — which means it is blocked by ad blockers, iOS 14 privacy settings and Safari ITP. Advertisers using browser-only pixels lose 30-40% of their conversion data. Meta Conversions API fixes this by sending events from your server, where no browser restriction can interfere. TrackHive connects your website to Meta CAPI without any server setup or developer work.',
    section_2_title: 'What TrackHive Sends to Meta CAPI',
    section_2_body: 'TrackHive automatically captures and sends every available customer information parameter with each event: email, phone number, first and last name, fbp cookie, fbc cookie, fbclid, IP address, user agent, city, country and postal code. All data is hashed with SHA-256 before transmission. This enrichment is what drives 90%+ match rates on Meta.',
    cta_title: 'Connect Meta CAPI in 5 Minutes',
    cta_subtitle: 'Free plan available. No credit card required. No developer needed.',
    cta_button_text: 'Connect Meta CAPI Free',
    published: true,
  },
  {
    type: 'integration',
    slug: 'tiktok-events-api',
    title: 'TikTok Events API Server-Side Tracking',
    meta_title: 'TikTok Events API Integration — TrackHive',
    meta_description: 'Connect TikTok Events API without a developer. Send server-side conversion events to TikTok Ads with 90%+ match rate in under 5 minutes.',
    h1: 'TikTok Events API Server-Side Tracking',
    hero_subtitle: 'Send TikTok conversion events from your server. Bypass ad blockers and iOS restrictions. Better data means better TikTok ad optimization.',
    platform_name: 'TikTok Events API',
    stat_1_number: '90%+',
    stat_1_label: 'Match rate on TikTok',
    stat_2_number: '5 min',
    stat_2_label: 'Setup time',
    stat_3_number: '0',
    stat_3_label: 'Lines of code needed',
    section_1_title: 'Why TikTok Browser Pixel is Not Enough',
    section_1_body: "TikTok's browser pixel faces the same challenges as every other client-side tracker — ad blockers, iOS 14 ATT and Safari ITP all reduce the events that reach TikTok. For advertisers scaling on TikTok, incomplete conversion data means the algorithm optimizes on partial information, leading to higher CPMs and worse targeting over time. TikTok Events API fixes this permanently.",
    section_2_title: 'Events TrackHive Sends to TikTok',
    section_2_body: "TrackHive supports all standard TikTok Events API events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, Contact, SubmitForm and CompleteRegistration. Each event is enriched with hashed email, phone, IP address, user agent and external_id for maximum match rate. Deduplication is handled automatically so browser and server events are never double counted.",
    cta_title: 'Connect TikTok Events API Today',
    cta_subtitle: 'Available on Pro and Agency plans. Start free and upgrade when ready.',
    cta_button_text: 'Connect TikTok Events API',
    published: true,
  },
  {
    type: 'integration',
    slug: 'ga4',
    title: 'GA4 Server-Side Tracking with Measurement Protocol',
    meta_title: 'GA4 Server-Side Tracking Integration — TrackHive',
    meta_description: 'Send GA4 events server-side using the Measurement Protocol. More accurate analytics, no ad blocker interference and complete conversion data in Google Analytics 4.',
    h1: 'GA4 Server-Side Tracking',
    hero_subtitle: 'Send events to Google Analytics 4 from your server using the Measurement Protocol. More complete data, less sampling and no ad blocker interference.',
    platform_name: 'Google Analytics 4',
    stat_1_number: '100%',
    stat_1_label: 'Events delivered',
    stat_2_number: '5 min',
    stat_2_label: 'Setup time',
    stat_3_number: '0%',
    stat_3_label: 'Data lost to blockers',
    section_1_title: 'GA4 Browser Tracking Limitations',
    section_1_body: 'Google Analytics 4 uses gtag.js which runs in the browser. Like all browser-based tracking, it is blocked by ad blockers and privacy-focused browsers. Studies suggest 15-40% of web traffic goes untracked by browser-based analytics tools. For advertisers relying on GA4 for attribution and audience building, this missing data creates blind spots in campaign performance.',
    section_2_title: 'How TrackHive Sends Events to GA4',
    section_2_body: "TrackHive uses the GA4 Measurement Protocol to send events directly from the server to Google Analytics 4. This means every PageView, purchase and conversion is recorded — regardless of what the user's browser blocks. All events include the client_id for session continuity and custom parameters for your specific tracking needs.",
    cta_title: 'Add GA4 Server-Side Tracking',
    cta_subtitle: 'Available on Pro and Agency plans.',
    cta_button_text: 'Connect GA4 Free',
    published: true,
  },
  {
    type: 'integration',
    slug: 'google-enhanced-conversions',
    title: 'Google Enhanced Conversions Setup Guide',
    meta_title: 'Google Enhanced Conversions Integration — TrackHive',
    meta_description: 'Set up Google Enhanced Conversions server-side without a developer. Send hashed customer data to Google Ads for more accurate conversion tracking and better ROAS.',
    h1: 'Google Enhanced Conversions',
    hero_subtitle: 'Send hashed customer data to Google Ads for more accurate conversion measurement. Recover lost conversions from cookie restrictions and consent mode.',
    platform_name: 'Google Enhanced Conversions',
    stat_1_number: '15%+',
    stat_1_label: 'More conversions recovered',
    stat_2_number: '5 min',
    stat_2_label: 'Setup time',
    stat_3_number: '100%',
    stat_3_label: 'Privacy compliant',
    section_1_title: 'What are Google Enhanced Conversions?',
    section_1_body: "Google Enhanced Conversions is a feature that improves the accuracy of your conversion measurement by sending hashed first-party customer data — email address, phone number, name — alongside your standard conversion tags. Google uses this data to recover conversions that are lost due to cookie restrictions, consent mode and browser privacy settings. It is Google's answer to the same data loss problem that Meta CAPI solves.",
    section_2_title: 'How TrackHive Connects to Google Enhanced Conversions',
    section_2_body: 'TrackHive sends conversion events to Google Ads Enhanced Conversions API server-side, including hashed email, phone and name with every purchase and lead event. This works alongside your existing Google Ads tags without any duplicate counting. The result is more complete conversion data in your Google Ads account and better Smart Bidding optimization.',
    cta_title: 'Set Up Google Enhanced Conversions',
    cta_subtitle: 'Available on Pro and Agency plans. Setup takes under 5 minutes.',
    cta_button_text: 'Connect Google Enhanced Conversions',
    published: true,
  },
  // COMPARE PAGES
  {
    type: 'compare',
    slug: 'trackhive-vs-stape',
    title: 'TrackHive vs Stape',
    meta_title: 'TrackHive vs Stape — Which Server-Side Tracking Tool is Better?',
    meta_description: 'TrackHive vs Stape compared. See features, pricing and ease of use side by side. Find out which server-side tracking tool is right for your business.',
    h1: 'TrackHive vs Stape',
    hero_subtitle: 'An honest comparison of two server-side tracking tools for performance marketers and agencies.',
    compare_tool_name: 'Stape',
    stat_1_number: '$0',
    stat_1_label: 'TrackHive free plan',
    stat_2_number: '5 min',
    stat_2_label: 'TrackHive setup time',
    stat_3_number: '90%+',
    stat_3_label: 'TrackHive match rate',
    section_1_title: 'How TrackHive and Stape Differ',
    section_1_body: 'Stape is a hosted server-side Google Tag Manager solution. It is powerful but requires GTM knowledge, container setup and ongoing tag management. TrackHive is purpose-built for performance marketers who want server-side tracking without the complexity. One script tag, no GTM required, and all platforms fire automatically. TrackHive also includes Lead Manager, anomaly detection and email alerts that Stape does not offer.',
    section_2_title: 'Pricing Comparison',
    section_2_body: 'Stape charges based on server requests and requires a paid plan from day one. TrackHive offers a free plan with 500 events per month — enough to test and verify your tracking before upgrading. Pro plan starts at $15 per month for 25,000 events across all platforms. Agency plan at $45 per month covers 25 pixels and 5 team members.',
    cta_title: 'Try TrackHive Free Today',
    cta_subtitle: 'No credit card required. Live in 5 minutes. Cancel anytime.',
    cta_button_text: 'Start Free with TrackHive',
    published: true,
  },
  {
    type: 'compare',
    slug: 'trackhive-vs-elevar',
    title: 'TrackHive vs Elevar',
    meta_title: 'TrackHive vs Elevar — Server-Side Tracking Comparison',
    meta_description: 'TrackHive vs Elevar compared for ecommerce tracking. Features, pricing and setup complexity side by side. Which is the better choice for your store?',
    h1: 'TrackHive vs Elevar',
    hero_subtitle: 'Comparing two server-side tracking tools for ecommerce advertisers.',
    compare_tool_name: 'Elevar',
    stat_1_number: '$15',
    stat_1_label: 'TrackHive Pro per month',
    stat_2_number: '5 min',
    stat_2_label: 'TrackHive setup time',
    stat_3_number: '4',
    stat_3_label: 'Platforms in TrackHive',
    section_1_title: 'Elevar vs TrackHive for Ecommerce',
    section_1_body: 'Elevar is a Shopify-focused server-side tracking solution with strong GTM integration. It works well for Shopify stores but requires GTM knowledge and is primarily designed for ecommerce. TrackHive supports both ecommerce and lead generation use cases, works with any website platform and does not require GTM. It also includes tools Elevar does not have — Lead Manager, anomaly detection and a cookie lifetime extender.',
    section_2_title: 'Which Should You Choose?',
    section_2_body: 'If you run a Shopify store and are already using GTM, Elevar is a solid option. If you want a simpler setup, support for non-Shopify platforms, or you run lead generation campaigns alongside ecommerce, TrackHive is the better fit. TrackHive also has a free plan and is significantly more affordable at scale.',
    cta_title: 'Switch to TrackHive',
    cta_subtitle: 'Free plan available. Works with any website platform.',
    cta_button_text: 'Try TrackHive Free',
    published: true,
  },
  {
    type: 'compare',
    slug: 'trackhive-vs-server-side-gtm',
    title: 'TrackHive vs Server-Side Google Tag Manager',
    meta_title: 'TrackHive vs Server-Side GTM — Which is Easier for Server-Side Tracking?',
    meta_description: 'TrackHive vs Server-Side Google Tag Manager compared. See why most advertisers choose TrackHive for faster setup, lower cost and better support.',
    h1: 'TrackHive vs Server-Side Google Tag Manager',
    hero_subtitle: 'Server-side GTM is powerful but complex. TrackHive gives you the same results in a fraction of the time.',
    compare_tool_name: 'Server-Side GTM',
    stat_1_number: '5 min',
    stat_1_label: 'TrackHive setup',
    stat_2_number: '3-7 days',
    stat_2_label: 'Server-side GTM setup',
    stat_3_number: '$0',
    stat_3_label: 'TrackHive free plan',
    section_1_title: 'The Problem with Server-Side GTM',
    section_1_body: 'Server-side Google Tag Manager is a powerful and flexible solution for server-side tracking. But it requires a Google Cloud or App Engine setup, GTM container configuration, custom client and tag templates and ongoing maintenance. The typical setup time is 3-7 days for a developer who knows what they are doing. For a non-technical advertiser, it is almost impossible without hiring help.',
    section_2_title: 'Why TrackHive is the Better Choice for Most Advertisers',
    section_2_body: "TrackHive delivers the same server-side tracking capabilities as server-side GTM — Meta CAPI, TikTok Events API, Google Enhanced Conversions and GA4 — without any cloud infrastructure, GTM knowledge or developer work. You paste one script tag and you are live. For agencies managing multiple clients, TrackHive's multi-pixel dashboard is far simpler than managing separate GTM containers per client.",
    cta_title: 'Skip the GTM Complexity',
    cta_subtitle: 'TrackHive gives you server-side tracking in 5 minutes. Free to start.',
    cta_button_text: 'Try TrackHive Free',
    published: true,
  },
  // PROBLEM PAGES
  {
    type: 'problem',
    slug: 'fix-ios14-tracking',
    title: 'Fix iOS 14 Tracking Loss — Server-Side Solution',
    meta_title: 'Fix iOS 14 Tracking Loss with Server-Side Tracking | TrackHive',
    meta_description: 'iOS 14 killed up to 40% of your Facebook ad conversions. Fix it permanently with server-side tracking via Meta CAPI. Setup in 5 minutes with TrackHive.',
    h1: 'Fix iOS 14 Tracking Loss Permanently',
    hero_subtitle: 'iOS 14 broke browser-based pixel tracking for millions of advertisers. Server-side tracking is the only permanent fix — and it takes 5 minutes to set up.',
    stat_1_number: '40%',
    stat_1_label: 'Conversions lost to iOS 14',
    stat_2_number: '97%',
    stat_2_label: 'Recovery with server-side',
    stat_3_number: '5 min',
    stat_3_label: 'Fix with TrackHive',
    section_1_title: 'Why iOS 14 Broke Your Facebook Tracking',
    section_1_body: "Apple's App Tracking Transparency (ATT) framework gave iPhone users the ability to block cross-app and cross-site tracking. Over 80% of users chose to opt out. This meant the Facebook Pixel — which relies on browser cookies and JavaScript — could no longer track conversions for the majority of iPhone visitors. The result was a sudden drop in reported conversions and a sharp rise in apparent CPL and CPA for most Facebook advertisers.",
    section_2_title: 'The Permanent Fix: Meta Conversions API',
    section_2_body: "Meta Conversions API sends conversion events directly from your server to Meta — not from the user's browser. This means iOS privacy settings, ATT prompts and browser restrictions have zero effect. TrackHive connects your website to Meta CAPI in minutes. Every conversion is captured and sent with enriched customer data for 90%+ match rates. Your Facebook campaigns get the full signal they need to optimize correctly.",
    cta_title: 'Fix iOS 14 Tracking in 5 Minutes',
    cta_subtitle: 'Free plan available. No developer or server required.',
    cta_button_text: 'Fix My Tracking Now',
    published: true,
  },
  {
    type: 'problem',
    slug: 'improve-meta-match-rate',
    title: 'Improve Meta Match Rate Above 90%',
    meta_title: 'How to Improve Meta Match Rate Above 90% | TrackHive',
    meta_description: 'Low Meta match rate killing your ROAS? TrackHive automatically sends all customer data parameters to push your match rate above 90%. Setup in 5 minutes.',
    h1: 'Improve Your Meta Match Rate to 90%+',
    hero_subtitle: 'Meta match rate directly impacts how well your ads optimize. Most advertisers are stuck at 55-70%. TrackHive pushes this above 90% automatically.',
    stat_1_number: '55%',
    stat_1_label: 'Average industry match rate',
    stat_2_number: '90%+',
    stat_2_label: 'TrackHive match rate',
    stat_3_number: '8',
    stat_3_label: 'Data parameters sent',
    section_1_title: 'Why Your Match Rate is Low',
    section_1_body: 'Meta match rate is determined by how much customer data you send with each conversion event. Browser pixels typically only send fbp and fbc cookies — and even those are often missing due to iOS restrictions or cookie blocking. Without email, phone number, name and other parameters, Meta struggles to match events to user accounts. The result is poor attribution and weak optimization signal.',
    section_2_title: 'How TrackHive Maximizes Match Rate',
    section_2_body: 'TrackHive captures every available customer data parameter and sends them all with every event: hashed email, hashed phone, hashed name, fbp, fbc, fbclid, IP address and user agent. This comprehensive data enrichment is what drives 90%+ match rates for TrackHive users. The higher your match rate, the better Meta can attribute conversions, build audiences and optimize your campaigns.',
    cta_title: 'Improve Your Match Rate Today',
    cta_subtitle: 'Free plan available. See your match rate improve within 24 hours.',
    cta_button_text: 'Improve My Match Rate',
    published: true,
  },
  // USE CASE PAGES
  {
    type: 'usecase',
    slug: 'shopify',
    title: 'Server-Side Tracking for Shopify Stores',
    meta_title: 'Server-Side Tracking for Shopify — Meta CAPI, TikTok & Google | TrackHive',
    meta_description: 'Add server-side tracking to your Shopify store in 5 minutes. Send purchase, add-to-cart and checkout events to Meta CAPI, TikTok and Google without any apps or code.',
    h1: 'Server-Side Tracking for Shopify',
    hero_subtitle: 'Recover lost conversions from ad blockers and iOS on your Shopify store. One script tag sends every purchase and add-to-cart event to Meta, TikTok and Google server-side.',
    stat_1_number: '40%',
    stat_1_label: 'Conversions recovered',
    stat_2_number: '5 min',
    stat_2_label: 'Setup time',
    stat_3_number: '90%+',
    stat_3_label: 'Meta match rate',
    section_1_title: 'Why Shopify Store Owners Need Server-Side Tracking',
    section_1_body: "Shopify's built-in pixel and the Facebook Sales Channel pixel are browser-based. They miss every conversion from ad-blocker users, iOS 14 opt-outs and Safari's ITP cookie restrictions. For a store doing $50K per month, this typically means $15,000-20,000 in monthly revenue is invisible to your ad platforms. Your campaigns optimize on incomplete data — and you pay more for worse results.",
    section_2_title: 'How to Add TrackHive to Shopify',
    section_2_body: 'Add TrackHive to Shopify by pasting the script tag into your theme.liquid file before the closing body tag. TrackHive then captures all ecommerce events — PageView, ViewContent, AddToCart, InitiateCheckout and Purchase — and fires them server-side to Meta CAPI, TikTok Events API, Google Enhanced Conversions and GA4 simultaneously. No Shopify app required. No monthly app fee.',
    cta_title: 'Add Server-Side Tracking to Your Shopify Store',
    cta_subtitle: 'Free plan available. Works with any Shopify theme.',
    cta_button_text: 'Start Free for Shopify',
    published: true,
  },
]

  for (const post of BLOG_POSTS) {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .upsert(
        {
          ...post,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
    if (error) console.error('Blog post error:', post.slug, error.message)
    else console.log('Inserted blog post:', post.slug)
  }

  for (const page of PSEO_PAGES) {
    const { error } = await supabaseAdmin
      .from('pseo_pages')
      .upsert({ ...page, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
    if (error) console.error('pSEO page error:', page.slug, error.message)
    else console.log('Inserted pSEO page:', page.slug)
  }

  console.log('Seed complete.')
})()
