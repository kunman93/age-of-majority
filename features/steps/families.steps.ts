import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const names = (list: string) => list.split(', ')

Then(
  'I see the family headings {string} in order',
  async ({ page }, headings: string) => {
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(
      names(headings),
    )
  },
)

Then('the family headings are below the intro', async ({ page }) => {
  const intro = await page.getByText(/^Today you come of age/).boundingBox()
  const headings = await page.getByRole('heading', { level: 2 }).all()
  for (const heading of headings) {
    const box = await heading.boundingBox()
    expect(box!.y).toBeGreaterThan(intro!.y + intro!.height - 1)
  }
})

Then(
  'the family {string} has messages signed by {string}',
  async ({ page }, family: string, authors: string) => {
    const region = page.getByRole('region', { name: family })
    await expect(region.locator('figcaption')).toHaveText(names(authors))
  },
)

When('I scroll to the family {string}', async ({ page }, family: string) => {
  await page.getByRole('region', { name: family }).scrollIntoViewIfNeeded()
})

Then(
  'the family {string} and its messages are visible',
  async ({ page }, family: string) => {
    const region = page.getByRole('region', { name: family })
    await expect(region.getByRole('heading', { name: family })).toBeInViewport()
    for (const message of await region.getByRole('figure').all()) {
      await expect(message).toBeInViewport()
    }
  },
)
