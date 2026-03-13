# Playwright E2E QA Tests

Comprehensive end-to-end tests for login, signup, public pages, dashboard, and APIs.

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests (starts dev server automatically)
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# View HTML report after run
npm run test:e2e:report
```

## Test Coverage

| Category | Tests |
|----------|-------|
| **Auth** | Login page, signup page, invalid credentials, redirect after login, links |
| **Public pages** | Home, TrackHive, pricing, features, integrations, blog, contact, docs, etc. |
| **Dashboard** | Unauthenticated redirect, authenticated access, all dashboard pages |
| **API** | Validate, cookie settings, event tracking endpoints |

## Environment Variables

For authenticated tests (login, dashboard pages), set:

- `TEST_USER_EMAIL` – A valid user email in your Supabase
- `TEST_USER_PASSWORD` – That user's password

Example:

```powershell
$env:TEST_USER_EMAIL="test@example.com"; $env:TEST_USER_PASSWORD="yourpass"; npm run test:e2e
```

Or create `.env.test` from `.env.test.example` and load it before running.

## Configuration

- `playwright.config.ts` – Base URL, browsers, webServer
- Tests start dev server on port **3099** by default (avoids conflict with manual dev)
- Set `PLAYWRIGHT_BASE_URL` to test against an existing server (e.g. `http://localhost:3000`)
