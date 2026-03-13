import { test as base } from '@playwright/test'

export const test = base.extend<{
  authenticatedPage: import('@playwright/test').Page
}>({
  authenticatedPage: async ({ page }, use) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD

    if (!email || !password) {
      console.warn('TEST_USER_EMAIL and TEST_USER_PASSWORD not set. Skipping authenticated tests.')
      await use(page)
      return
    }
    if (email.endsWith('.comm')) {
      console.warn('Fix email typo: use .com not .comm. Skipping authenticated tests.')
      await use(page)
      return
    }

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
    await use(page)
  },
})

export { expect } from '@playwright/test'
