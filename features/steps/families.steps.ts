import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { intro } from '../support/intro.ts'
import { opacityOf, scrollTopTo } from '../support/scroll.ts'

const { Given, When, Then } = createBdd()

const names = (list: string) => list.split(', ')

Then(
  'I see the family headings {string} in order',
  async ({ page }, headings: string) => {
    await expect(
      page.getByRole('heading', { level: 3, name: /^Family / }),
    ).toHaveText(names(headings))
  },
)

Then('the family headings are below the intro', async ({ page }) => {
  const introBox = await intro(page).boundingBox()
  const headings = await page
    .getByRole('heading', { level: 3, name: /^Family / })
    .all()
  for (const heading of headings) {
    const box = await heading.boundingBox()
    expect(box!.y).toBeGreaterThan(introBox!.y + introBox!.height - 1)
  }
})

Then(
  'I see the heading {string} below the intro',
  async ({ page }, name: string) => {
    const introBox = await intro(page).boundingBox()
    const box = await page
      .getByRole('heading', { level: 2, name, exact: true })
      .boundingBox()
    expect(box!.y).toBeGreaterThan(introBox!.y + introBox!.height - 1)
  },
)

Then(
  'I see the overline {string} directly above it',
  async ({ page }, text: string) => {
    const overline = await page.getByText(text, { exact: true }).boundingBox()
    const heading = await page
      .getByRole('heading', { level: 2, name: 'Birthday wishes' })
      .boundingBox()
    const gap = heading!.y - (overline!.y + overline!.height)
    expect(gap).toBeGreaterThanOrEqual(-1)
    expect(gap).toBeLessThan(overline!.height)
  },
)

Then(
  'every family heading is below the heading {string}',
  async ({ page }, name: string) => {
    const wishes = await page
      .getByRole('heading', { level: 2, name, exact: true })
      .boundingBox()
    for (const heading of await page
      .getByRole('heading', { level: 3, name: /^Family / })
      .all()) {
      const box = await heading.boundingBox()
      expect(box!.y).toBeGreaterThan(wishes!.y + wishes!.height - 1)
    }
  },
)

Then(
  'the family {string} has messages signed by {string}',
  async ({ page }, family: string, authors: string) => {
    const region = page.getByRole('region', { name: family })
    await expect(region.locator('figcaption')).toHaveText(names(authors))
  },
)

Given('a short browser window', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 })
})

Then('the family {string} is not in view', async ({ page }, family: string) => {
  await expect(
    page.getByRole('region', { name: family }).getByRole('heading'),
  ).not.toBeInViewport()
})

When('I scroll to the family {string}', async ({ page }, family: string) => {
  await scrollTopTo(page.getByRole('region', { name: family }), 0)
})

Then(
  'the family {string} and its messages are visible',
  async ({ page }, family: string) => {
    const region = page.getByRole('region', { name: family })
    await expect(region.getByRole('heading', { name: family })).toBeInViewport()
    for (const message of await region.getByRole('figure').all()) {
      await expect(message).toBeInViewport()
      await expect.poll(() => opacityOf(message)).toBe(1)
    }
  },
)

Then('the page scrolls without animation', async ({ page }) => {
  const root = page.locator('html')
  await expect(root).toHaveCSS('scroll-behavior', 'auto')
  await expect(root).toHaveCSS('scroll-snap-type', 'none')
})
