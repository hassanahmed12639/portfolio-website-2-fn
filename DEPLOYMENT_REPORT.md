# TrackHive — Deployment Readiness Report

## 1. `src/app/api/event/route.ts` — Completeness & correctness

**Verdict: Complete and working, with one stub.**

- **Auth:** Validates `api_key`, loads profile and plan limits.
- **Limits:** Enforces monthly event limits (500 free, 50k pro/trial, unlimited agency); returns 429 with `upgrade_url` when over limit.
- **Integrations:** Loads `integrations`, `privacy_settings`, `header_settings`, `enrichment_settings`.
- **Consent:** When `consent_mode` and `consent_rejected`, events are logged with `status: 'consent_rejected'` and not forwarded; `events_used` is still incremented.
- **Forwarding:** Meta CAPI, TikTok, Snapchat, GA4 are implemented. **Google (Enhanced Conversions)** is a stub: logs `[event] Google integration (not implemented)` and returns `status: 'success'` without sending to Google.
- **Events table:** Inserts one row per integration (or consent-rejected flow) with `user_id`, `event_name`, `platform`, `value`, `status`, `ip`, `event_id`, validation fields, `payload`; optional enrichment and `original_payload`/`retry_count`/`next_retry_at` for failures.
- **Profile update:** Increments `events_used` when `!is_test`.
- **Edge case:** If a user has zero integrations, the loop runs 0 times, no events are inserted, but `events_used` is still incremented and response is `{ success: true, platforms_fired: [] }`. Consider whether to only increment when at least one event is stored.

**Action:** Implement Google Enhanced Conversions in the `integration.platform === 'google'` branch if you need it; otherwise leave as-is or return `status: 'failed'` and log the event for retry.

---

## 2. `src/middleware.ts` — Dashboard protection

**Verdict: Yes, it protects /dashboard routes.**

- **Matcher:** Runs on all paths except `_next/static`, `_next/image`, `favicon.ico`, and common image extensions. So `/dashboard/*` and `/api/*` both run middleware.
- **Logic:**
  - `pathname.startsWith('/dashboard')` → dashboard.
  - `/dashboard/login` and `/dashboard/signup` are treated as auth pages.
  - If dashboard and not auth page and **no session** → redirect to `/dashboard/login`.
  - If auth page and **has session** → redirect to `/dashboard`.
- **Result:** All dashboard routes except login/signup require a session; unauthenticated users are sent to login. API routes are not redirected (middleware only redirects for dashboard + no session).

No changes required for basic protection.

---

## 3. Environment variables — Full list

Every variable used in the app (server and client):

| Variable | Where used | Required |
|----------|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client (middleware, server, client), all API routes using service role | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server Supabase client, middleware | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | event, cron/monthly-reset, privacy/delete-data, privacy/auto-cleanup, enrichment/enrich, proxy, cookie/*, playground/send, event-replay/*, anomalies/detect, integrations/save | **Yes** |
| `CRON_SECRET` | api/cron/monthly-reset (header check) | **Yes** (for cron) |
| `GROQ_API_KEY` | api/scanner, api/ai/analyze, api/attribution/analyze, api/ai/utm-cleaner | **Yes** (for AI/scanner features) |
| `OPENROUTER_API_KEY` | api/anomalies/detect | **Yes** (for anomaly detection) |
| `NEXT_PUBLIC_APP_URL` | api/anomalies/detect (HTTP-Referer fallback) | Optional (fallback: `https://trackhive.app`) |
| `NEXT_PUBLIC_CHAT_API_URL` | ChatWidget.tsx (chat backend) | Optional (fallback: `http://localhost:8000`) |

**Summary — set these in production (e.g. Vercel):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` (same value as in .env.local; Vercel sends it as `Authorization: Bearer <CRON_SECRET>` for crons)
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_APP_URL` (e.g. `https://track.itshassanahmed.com` or your production domain)
- `NEXT_PUBLIC_CHAT_API_URL` (if you use the chat widget; otherwise remove or leave unset)

---

## 4. `public/th.js` — Tracking snippet

**Verdict: Complete for production.**

- Reads `window.TRACKHIVE_KEY`; warns if missing.
- `extend()`: calls `/api/cookie/set?api_key=...` on `https://track.itshassanahmed.com`.
- `track()`: POSTs to `https://track.itshassanahmed.com/api/event` with `api_key`, `event_name`, `event_id`, `value`, `currency`, `email`, `phone`, `visitor_id`.
- `pageview()`: calls `track('PageView', {})`.
- Load runs `extend()` and `pageview()`.

No localhost; production base URL is correct. Optional: add `event_source_url` from `document.referrer` or `window.location.href` if you want it in the payload.

---

## 5. `next.config.js` — Issues

**Verdict: No blocking issues.**

- `reactStrictMode: true` — fine.
- `images.remotePatterns` — Clerk, Unsplash; no Clearbit (only needed if you re-enable trust bar logos).
- `webpack` alias `@` → `src` — fine.

If you add external image domains later, add them to `remotePatterns`.

---

## 6. TypeScript / imports

- **Linter:** No errors reported on `event/route.ts`, `middleware.ts`, `plans.ts`.
- **Imports:** `event/route.ts` correctly imports `validateEvent`, `enrichEvent`, `createClient` (Supabase), `createHash` (crypto), `NextRequest`/`NextResponse`.
- **`crypto`:** Used in Node API routes; fine on Vercel (Node runtime). `crypto.randomUUID()` is used in event route (global in Node 19+).

No TypeScript errors or missing imports found in the reviewed files. For a full check run: `npx tsc --noEmit`.

---

## 7. Hardcoded localhost / URLs

| Location | Value | Action |
|----------|--------|--------|
| `src/components/ChatWidget.tsx` | `process.env.NEXT_PUBLIC_CHAT_API_URL \|\| 'http://localhost:8000'` | Set `NEXT_PUBLIC_CHAT_API_URL` in production or remove widget. |
| `chatbot_api.py` | `http://localhost:3000`, `http://localhost:3001` | Dev CORS only; no change for Next app. |
| `README.md` | `http://localhost:3000` | Doc only. |

Rest of app uses `https://track.itshassanahmed.com` for API, cookie, and snippet URLs (trackhive page, templates, setup, reverse-proxy, cookie-extender, proxy route). No other localhost in the Next app.

---

## 8. Supabase tables and columns (inferred from code)

Ensure your Supabase schema matches this. Queries assume these tables/columns exist:

| Table | Columns referenced (select/insert/update/upsert) |
|-------|--------------------------------------------------|
| **profiles** | id, email, api_key, plan, is_trial, trial_expires_at, trial_started_at, events_used, events_reset_at, monthly_scans, monthly_ai_analyses, scans_reset_at, ai_analyses_reset_at |
| **integrations** | id, user_id, platform, pixel_id, access_token, tag_id, is_active |
| **events** | id, user_id, event_name, platform, value, status, ip, event_id, validation_score, validation_issues, validation_checks, payload, country, city, device_type, customer_type, enriched_data, original_payload, retry_count, next_retry_at, created_at |
| **privacy_settings** | user_id, ip_modification, strip_query_params, anonymize_user_agent, consent_mode, auto_delete_enabled, data_retention_days |
| **header_settings** | user_id, is_active, forward_user_agent, override_user_agent, custom_user_agent, forward_ip, forward_referer, forward_origin, custom_headers, meta_send_test_event_code, meta_test_event_code, meta_send_action_source, meta_action_source |
| **enrichment_settings** | user_id, geo_enabled, device_enabled, customer_type_enabled, ltv_enabled, email_hash_enabled, phone_hash_enabled |
| **cookie_settings** | user_id, cookie_lifetime_days, cookie_name, is_active |
| **cookie_visitors** | id, user_id, visitor_id (?), visit_count, first_seen, last_seen (and insert columns) |
| **proxy_logs** | (insert only; structure implied by proxy route) |
| **attribution_scores** | user_id, conversion_id, truth_score, meta_score, google_score, breakdown, event fields for upsert |

**Cron monthly-reset** updates `profiles`: `events_used`, `monthly_scans`, `monthly_ai_analyses`, `scans_reset_at`, `ai_analyses_reset_at`. Ensure `scans_reset_at` and `ai_analyses_reset_at` exist (e.g. `timestamptz`).

**Billing page** selects `events_reset_at` from `profiles`; if you use it for UI, keep that column.

---

## 9. Pre-deploy checklist

- [ ] **Env (Vercel):** Set all variables from §3 (at least SUPABASE_*, CRON_SECRET, GROQ_API_KEY, OPENROUTER_API_KEY, NEXT_PUBLIC_APP_URL).
- [ ] **Supabase:** Confirm all tables and columns in §8 exist; add `scans_reset_at` and `ai_analyses_reset_at` on `profiles` if missing.
- [ ] **Google Enhanced Conversions:** Either implement in `event/route.ts` or accept stub (success with no outbound call).
- [ ] **Cron:** In Vercel, add `CRON_SECRET` to env; cron runs at `0 0 1 * *` (1st of month 00:00 UTC).
- [ ] **Chat:** Set `NEXT_PUBLIC_CHAT_API_URL` if using ChatWidget; otherwise ensure chat is disabled or points to a valid backend.
- [ ] **Domain:** Point your domain (e.g. track.itshassanahmed.com) to Vercel; ensure `th.js` and `/api/event`, `/api/cookie/set` are served from that host if you use it in snippets.
- [ ] **Event route:** Decide whether to increment `events_used` when there are zero integrations; change logic if you want to only count when at least one event is stored.
- [ ] **Run:** `npm run build` and fix any build errors; run `npx tsc --noEmit` for full TS check.

---

*Report generated from codebase review. Re-validate after schema or env changes.*
