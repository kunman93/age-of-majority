import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

When('I open the home page', async ({ page }) => {
  await page.goto('/')
})

Then('I see the heading {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible()
})
