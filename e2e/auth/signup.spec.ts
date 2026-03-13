import { test, expect } from '@playwright/test'

test.describe('Signup', () => {
  test('signup page loads and shows form', async ({ page }) => {
    await page.goto('/dashboard/signup')
    await expect(page.getByText(/create your account/i)).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('link to login works', async ({ page }) => {
    await page.goto('/dashboard/signup')
    await expect(page.locator('#email')).toBeVisible()
    await page.locator('a[href="/dashboard/login"]').click()
    await expect(page).toHaveURL(/\/dashboard\/login/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('Google sign up button is present', async ({ page }) => {
    await page.goto('/dashboard/signup')
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })
})
