import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { When, Then } = createBdd()

const finale = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: "Here's to you, Sara!" })

Then(
  'I see the finale {string} with the message {string} and the signature {string}',
  async ({ page }, heading: string, message: string, signature: string) => {
    const region = finale(page)
    await expect(region.getByRole('heading')).toHaveText(heading)
    await expect(region.getByRole('paragraph')).toHaveText([message, signature])
  },
)

Then(
  'the finale is below the family {string}',
  async ({ page }, family: string) => {
    const last = await page.getByRole('region', { name: family }).boundingBox()
    const box = await finale(page).boundingBox()
    expect(box!.y).toBeGreaterThan(last!.y + last!.height - 1)
  },
)

Then('the finale is not in view', async ({ page }) => {
  await expect(finale(page).getByRole('heading')).not.toBeInViewport()
})

When('I scroll to the finale', async ({ page }) => {
  await finale(page).scrollIntoViewIfNeeded()
})

Then(
  'the finale heading, message and signature are visible',
  async ({ page }) => {
    const region = finale(page)
    const parts = [
      region.getByRole('heading'),
      ...(await region.getByRole('paragraph').all()),
    ]
    for (const part of parts) {
      await expect(part).toBeInViewport({ ratio: 1 })
      await expect(part).toBeVisible()
      const staticAtEveryLevel = await part.evaluate((element) => {
        for (
          let node: typeof element | null = element;
          node;
          node = node.parentElement
        ) {
          const style = node.ownerDocument.defaultView!.getComputedStyle(node)
          const isStatic =
            style.opacity === '1' &&
            style.animationName === 'none' &&
            parseFloat(style.transitionDuration) === 0
          if (!isStatic) return false
        }
        return true
      })
      expect(staticAtEveryLevel).toBe(true)
    }
  },
)
