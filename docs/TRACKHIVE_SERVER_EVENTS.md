# TrackHive server-side events (`/api/event`)

## Response shape

Successful requests return:

```json
{
  "success": true,
  "platforms_fired": ["meta", "ga4", "tiktok", "google"],
  "delivery": {
    "meta": "sent",
    "ga4": "sent",
    "tiktok": "sent",
    "google": "sent"
  }
}
```

Status values are typically: `sent`, `skipped`, `duplicate`, or `error:...`.

## Per-tenant configuration (Supabase `integrations`)

| Platform | Required columns |
|----------|------------------|
| **meta** | `platform='meta'`, `pixel_id`, `access_token` (encrypted or plain) |
| **ga4** | `platform='ga4'`, `tag_id` (measurement ID `G-...`), `access_token` (GA4 API secret) |
| **tiktok** | `platform='tiktok'`, `pixel_id`, `access_token` |
| **google** | `platform='google'`, `conversion_id` (`AW-...`), `conversion_label` |

Optional: **`pixels`** table — additional Meta pixels (`platform='meta'`, `pixel_id`, `access_token`).

## Meta CAPI (HTTP 400)

For `action_source: website`, Meta requires a **non-empty `event_source_url`** (valid `http(s)` URL) and **`client_user_agent`**. Server-side tests that omit `event_source_url` in the JSON body used to return **400**; the API now falls back to `NEXT_PUBLIC_APP_URL` or the incoming request URL.

If Meta still returns an error, check server logs for `[Meta CAPI]` — the Graph API error body is logged. Typical fixes: invalid/expired access token, pixel ID not tied to that token, or domain verification in Events Manager.

## Meta fallback (single-tenant / bootstrap)

If a user has **no** `integrations` row with `platform='meta'`, the server can still send Meta CAPI using:

- `META_PIXEL_ID`
- `META_ACCESS_TOKEN`

Set these in Vercel/hosting env. **Multi-tenant SaaS:** prefer a Meta row per customer; only use env fallback when you intentionally share one pixel.

## Google Ads conversions

- **GA4 Measurement Protocol** fires from the `ga4` integration row (all mapped events).
- **Google Ads enhanced conversions** fire only for conversion-class event names (e.g. `Lead`, `Purchase`, `AddToCart`, …) when both `google` and `ga4` rows exist with valid IDs/secrets.

Non-conversion events (e.g. `PageView`) report `google: skipped` — this is expected.

## Client script (`th.js`)

Load with your **TrackHive API key** (profile `api_key`), not the Meta Pixel ID:

```
https://<your-domain>/th.js?id=<TRACKHIVE_API_KEY>
```

## Env vars reference

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TRACKHIVE_API_KEY` | Public key embedded in `th.js` loader (must match a profile `api_key`) |
| `META_PIXEL_ID` / `META_ACCESS_TOKEN` | Meta CAPI when no DB Meta integration |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` / `GA4_API_SECRET` | Fallbacks used by helpers |
| `GOOGLE_ADS_CONVERSION_ID` / `GOOGLE_ADS_CONVERSION_LABEL` | Fallbacks for Google |
