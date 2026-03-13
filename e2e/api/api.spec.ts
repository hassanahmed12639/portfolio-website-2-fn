import { test, expect } from '@playwright/test'

const port = process.env.PLAYWRIGHT_PORT ? parseInt(process.env.PLAYWRIGHT_PORT, 10) : 3099
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`

test.describe('API Health', () => {
  test('validate API responds', async ({ request }) => {
    const res = await request.post(`${baseURL}/api/validate`, {
      data: { api_key: 'test-key' },
    })
    expect(res.status()).toBeLessThan(500)
  })

  test('cookie settings GET', async ({ request }) => {
    const res = await request.get(`${baseURL}/api/cookie/settings`)
    expect(res.status()).toBeLessThan(500)
  })

  test('event API accepts POST (tracking)', async ({ request }) => {
    const res = await request.post(`${baseURL}/api/event`, {
      data: { name: 'e2e_test', api_key: 'test' },
    })
    expect(res.status()).toBeLessThan(500)
  })
})
