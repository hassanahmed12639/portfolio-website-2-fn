# Security Hardening Checklist

This document summarizes the security measures applied and deployment requirements.

## Applied Security Measures

### 1. Dependencies
- **Next.js 14.2.35** – Pinned to latest 14.x for security patches
- **eslint-config-next 14.2.35** – Updated for compatibility
- Run `npm audit` regularly; plan upgrade to Next.js 15+ for latest CVEs when feasible

### 2. Portfolio Admin Auth
- **Signed session tokens** – Cookie value is now a cryptographically signed token (not `"true"`)
- **Rate limiting** – 5 login attempts per 15 minutes per IP (brute-force protection)
- **Timing-safe password comparison** – Prevents timing attacks
- **Secure cookies** – `httpOnly`, `secure` in production, `sameSite: lax`

### 3. Security Headers (next.config.js)
- **X-Frame-Options: DENY** – Prevents clickjacking
- **X-Content-Type-Options: nosniff** – Prevents MIME sniffing
- **Strict-Transport-Security** – Enforces HTTPS, 2-year max-age
- **Content-Security-Policy** – Restricts script, style, connect, and other resource sources
- **Permissions-Policy** – Restricts camera, microphone, geolocation, etc.
- **Referrer-Policy** – Limits referrer leakage

### 4. Middleware Protections
- Blocks path traversal (`../`, `.env`, `.git`)
- Blocks common attack paths (wp-admin, wp-login, phpmyadmin, adminer, .php, .asp)

### 5. API Security
- Cron routes protected with `CRON_SECRET` header
- PayPal webhook verifies signature
- Event API has rate limiting (200 req/min per IP)
- Supabase auth for protected API routes

### 6. Environment
- `.env`, `.env*.local`, `.env.production` in `.gitignore`
- Use `.env.example` as template; never commit real credentials

## Deployment Checklist

- [ ] Ensure `PORTFOLIO_ADMIN_PASSWORD` is strong (min 8 chars, mixed case, numbers, symbols)
- [ ] Set `PORTFOLIO_ADMIN_SESSION_SECRET` in production (optional; 32+ char random string)
- [ ] Rotate any exposed secrets if `.env.production` or credentials were ever committed or shared
- [ ] Configure `CRON_SECRET` for cron endpoints (e.g., Vercel Cron)
- [ ] Use HTTPS only (HSTS header enforces this)
- [ ] Run `npm audit` before each deployment

## If Credentials Were Exposed

1. Rotate **PORTFOLIO_ADMIN_PASSWORD** immediately
2. Regenerate **Supabase** keys if needed
3. Regenerate **PayPal** client secret
4. Regenerate **CRON_SECRET**
5. Regenerate all API keys (GROQ, OpenRouter, Resend, Meta, TikTok, etc.)
