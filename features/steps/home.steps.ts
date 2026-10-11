import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('I open the home page', async ({ page }) => {
  await page.goto('/')
})

Then('I see the heading {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})

Then('the heading is styled with Tailwind', async ({ page }) => {
  const heading = page.getByRole('heading')
  await expect(heading).toHaveCSS('font-size', '30px')
  await expect(heading).toHaveCSS('font-weight', '700')
})
