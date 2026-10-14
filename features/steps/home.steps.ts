import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { intro, waitUntilIntroIsTyped } from '../support/intro.ts'

const { When, Then } = createBdd()

When('I open the home page', async ({ page }) => {
  await page.goto('/')
})

Then('I see the heading {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
})

Then('I see the intro {string}', async ({ page }, text: string) => {
  await waitUntilIntroIsTyped(page)
  await expect(intro(page)).toBeVisible()
  await expect(page.locator('[data-intro] [data-typed-text]')).toHaveText(text)
})

Then('the intro is below the heading', async ({ page }) => {
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  const introBox = await intro(page).boundingBox()
  expect(introBox!.y).toBeGreaterThan(heading!.y + heading!.height - 1)
})

const CENTER_TOLERANCE = 2

type Box = { x: number; y: number; width: number; height: number }

// Both boxes come from one layout pass, after the web fonts have loaded
const measureOpening = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready
    const box = (element: Element | null): Box => {
      const { x, y, width, height } = element!.getBoundingClientRect()
      return { x, y, width, height }
    }
    const paragraphs = [...document.querySelectorAll('p')]
    return {
      heading: box(document.querySelector('h1')),
      intro: box(
        paragraphs.find((p) =>
          p.textContent?.startsWith('Today you come of age'),
        ) ?? null,
      ),
      showcase: box(document.querySelector('[data-showcase]')),
    }
  })

Then(
  'the heading and the intro are centered in the window',
  async ({ page }) => {
    const { heading, intro } = await measureOpening(page)
    const { width, height } = page.viewportSize()!
    const left = Math.min(heading.x, intro.x)
    const right = Math.max(heading.x + heading.width, intro.x + intro.width)
    const top = heading.y
    const bottom = intro.y + intro.height
    expect(Math.abs((left + right) / 2 - width / 2)).toBeLessThanOrEqual(
      CENTER_TOLERANCE,
    )
    expect(Math.abs((top + bottom) / 2 - height / 2)).toBeLessThanOrEqual(
      CENTER_TOLERANCE,
    )
  },
)

Then('the text of the heading and the intro is centered', async ({ page }) => {
  for (const locator of [
    page.getByRole('heading', { level: 1 }),
    intro(page),
  ]) {
    await expect(locator).toHaveCSS('text-align', 'center')
  }
})

Then(
  'the content after the intro starts at or below the bottom of the window',
  async ({ page }) => {
    const { intro, showcase } = await measureOpening(page)
    expect(showcase.y).toBeGreaterThanOrEqual(page.viewportSize()!.height)
    expect(showcase.y).toBeGreaterThan(intro.y + intro.height)
  },
)
