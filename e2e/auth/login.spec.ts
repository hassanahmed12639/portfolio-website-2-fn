import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/dashboard/login')
    await expect(page).toHaveURL(/\/dashboard\/login/)
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/dashboard/login')
    await page.locator('#email').fill('invalid@test.com')
    await page.locator('#password').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page.getByText(/invalid|incorrect|credentials/i)).toBeVisible({ timeout: 10_000 })
  })

  test('redirects to dashboard after successful login', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    if (!email || !password) {
      test.skip()
    }
    // Common typo: .comm instead of .com causes login to fail
    if (email.endsWith('.comm')) {
      test.skip(true, 'Fix email typo: use .com not .comm (e.g. user@gmail.com)')
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
      { timeout: 20_000 }
    )
  })

  test('link to signup works', async ({ page }) => {
    test.setTimeout(30_000)
    await page.goto('/dashboard/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })
    await page.locator('a[href="/dashboard/signup"]').click()
    await expect(page).toHaveURL(/\/dashboard\/signup/, { timeout: 15_000 })
    await expect(page.getByText(/create your account/i)).toBeVisible({ timeout: 15_000 })
  })

  test('Google sign in button is present', async ({ page }) => {
    await page.goto('/dashboard/login')
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })
})
