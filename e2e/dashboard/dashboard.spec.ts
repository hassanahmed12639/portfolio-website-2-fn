import { test, expect } from '@playwright/test'

test.describe('Dashboard - Auth Required', () => {
  test('unauthenticated user redirects to login', async ({ page }) => {
    const res = await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard\/login/, { timeout: 10_000 })
    expect(page.url()).toContain('/dashboard/login')
  })

  test('authenticated user can access dashboard', async ({ page }) => {
    test.setTimeout(45_000)
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    if (!email || !password) test.skip()
    if (email.endsWith('.comm')) test.skip(true, 'Fix email typo: use .com not .comm')

    await page.goto('/dashboard/login')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL(
      (url) => {
        const path = new URL(url).pathname
        return path === '/onboarding' || path === '/dashboard' || (path.startsWith('/dashboard/') && !path.startsWith('/dashboard/login'))
      },
      { timeout: 15_000 }
    )

    if (page.url().includes('/onboarding')) return

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
