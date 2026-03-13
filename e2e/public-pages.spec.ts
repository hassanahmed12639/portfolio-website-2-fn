import { test, expect } from '@playwright/test'

const publicPages = [
  { path: '/', name: 'Home' },
  { path: '/trackhive', name: 'TrackHive' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/features', name: 'Features' },
  { path: '/integrations', name: 'Integrations' },
  { path: '/blog', name: 'Blog' },
  { path: '/contact', name: 'Contact' },
  { path: '/privacy-policy', name: 'Privacy Policy' },
  { path: '/tos', name: 'Terms of Service' },
  { path: '/dashboard/login', name: 'Login' },
  { path: '/dashboard/signup', name: 'Signup' },
  { path: '/onboarding', name: 'Onboarding' },
  { path: '/admin/login', name: 'Admin Login' },
  { path: '/docs', name: 'Docs' },
]

test.describe('Public Pages', () => {
  for (const { path, name } of publicPages) {
    test(`${name} (${path}) loads and returns 200`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page).not.toHaveURL(/404|not-found/)
    })
  }
})
