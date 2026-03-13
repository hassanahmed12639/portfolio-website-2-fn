import { test, expect } from '@playwright/test'

/**
 * Dashboard pages accessible with Pro/Agency plan.
 * Run with TEST_USER_EMAIL + TEST_USER_PASSWORD set for authenticated tests.
 */
const dashboardPages = [
  '/dashboard',
  '/dashboard/setup',
  '/dashboard/billing',
  '/dashboard/settings',
  '/dashboard/account',
  '/dashboard/leads',
  '/dashboard/live',
  '/dashboard/event-replay',
  '/dashboard/raw-data',
  '/dashboard/templates',
  '/dashboard/data-quality',
  '/dashboard/validator',
  '/dashboard/deduplication',
  '/dashboard/retry-queue',
  '/dashboard/headers',
  '/dashboard/cookie-extender',
  '/dashboard/anomalies',
  '/dashboard/enrichment',
  '/dashboard/integrations',
  '/dashboard/reverse-proxy',
  '/dashboard/attribution',
  '/dashboard/connectors',
  '/dashboard/custom-dashboards',
  '/dashboard/ai-analysis',
  '/dashboard/playground',
  '/dashboard/alerts',
  '/dashboard/logs',
  '/dashboard/pixels',
  '/dashboard/privacy',
  '/dashboard/scanner',
  '/dashboard/regex-library',
  '/dashboard/team',
]

test.describe('Dashboard Pages - Authenticated', () => {
  test.setTimeout(60_000) // Heavy pages, slow in CI

  test.beforeEach(async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    if (!email || !password) test.skip()
    if (email?.endsWith('.comm')) test.skip(true, 'Fix email typo: use .com not .comm')

    await page.goto('/dashboard/login')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL(
      (url) => {
        const path = new URL(url).pathname
        return path === '/onboarding' || path === '/dashboard' || (path.startsWith('/dashboard/') && !path.startsWith('/dashboard/login'))
      },
      { timeout: 25_000 }
    )
    if (page.url().includes('/onboarding')) test.skip()
  })

  for (const path of dashboardPages) {
    test(`${path} loads or redirects (e.g. to billing for plan)`, async ({ page }) => {
      const res = await page.goto(path, { timeout: 45_000 })
      expect(res?.status()).toBeLessThan(500)
      await expect(page.locator('body')).toBeVisible({ timeout: 15_000 })
    })
  }
})
