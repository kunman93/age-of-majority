import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('I open the home page', async ({ page }) => {
  await page.goto('/')
})

Then('I see the heading {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('I see the intro {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible()
})

Then('the intro is below the heading', async ({ page }) => {
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  const intro = await page.getByText(/^Today you come of age/).boundingBox()
  expect(intro!.y).toBeGreaterThan(heading!.y + heading!.height - 1)
})
