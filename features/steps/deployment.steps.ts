import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

Then(
  'the page tells search engines not to index it or follow its links',
  async ({ page }) => {
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content')
    expect(robots?.split(',').map((value) => value.trim())).toEqual(
      expect.arrayContaining(['noindex', 'nofollow']),
    )
  },
)

Then('the page sends no referrer to other sites', async ({ page }) => {
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute(
    'content',
    'no-referrer',
  )
})
