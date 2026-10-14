/// <reference lib="dom" />
import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { opacityOf, scrollTopTo } from '../support/scroll.ts'

const { When, Then } = createBdd()

const OPENING = '[data-opening]'
const SETTLE_TIMEOUT_MS = 5000

const offsetYOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const { transform } = getComputedStyle(element)
    return transform === 'none' ? 0 : new DOMMatrix(transform).m42
  })

const expectFinalState = async (locator: Locator) => {
  await expect
    .poll(() => opacityOf(locator), { timeout: SETTLE_TIMEOUT_MS })
    .toBe(1)
  await expect
    .poll(() => offsetYOf(locator), { timeout: SETTLE_TIMEOUT_MS })
    .toBe(0)
}

const section = (page: Page, family: string) =>
  page.getByRole('region', { name: family })

const heading = (page: Page, family: string) =>
  section(page, family).getByRole('heading', { name: family })

const finale = (page: Page) =>
  page.getByRole('region', { name: "Here's to you, Sara!" })

const intro = (page: Page) => page.getByText(/^Today you come of age/)

Then('the greeting and the full intro are shown at once', async ({ page }) => {
  for (const text of [page.getByRole('heading', { level: 1 }), intro(page)]) {
    await expect(text).toBeVisible()
    expect(await opacityOf(text)).toBe(1)
  }
  await expect(intro(page)).toHaveText(
    /^Today you come of age.*Scroll on and read what they have to say\.$/,
  )
})

Then('the greeting and the full intro are fully visible', async ({ page }) => {
  for (const text of [page.getByRole('heading', { level: 1 }), intro(page)]) {
    await expectFinalState(text)
  }
})

Then('no content has been faded or moved', async ({ page }) => {
  const touched = await page.locator('main, main *').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const { style } = element as HTMLElement
        return style.opacity !== '' || style.transform !== ''
      })
      .map((element) => element.tagName),
  )
  expect(touched).toEqual([])
})

When(
  'I scroll until the opening is half out of the viewport',
  async ({ page }) => {
    await page
      .locator(OPENING)
      .evaluate((opening) => window.scrollTo(0, opening.clientHeight / 2))
  },
)

Then('the opening is partly faded out', async ({ page }) => {
  await expect
    .poll(() => opacityOf(page.locator(OPENING)), {
      timeout: SETTLE_TIMEOUT_MS,
    })
    .toBeLessThan(1)
  expect(await opacityOf(page.locator(OPENING))).toBeGreaterThan(0)
})

When(
  'I scroll until the top of the {string} section just enters the viewport from below',
  async ({ page }, family: string) => {
    await scrollTopTo(section(page, family), 1, -1)
  },
)

When(
  'I scroll until the top of the {string} section is just above the bottom of the viewport',
  async ({ page }, family: string) => {
    await scrollTopTo(section(page, family), 1)
  },
)

When(
  'I scroll until the {string} heading is in the upper half of the viewport',
  async ({ page }, family: string) => {
    await scrollTopTo(heading(page, family), 0.25)
  },
)

Then(
  'the {string} heading is not fully visible',
  async ({ page }, family: string) => {
    await expect
      .poll(() => opacityOf(heading(page, family)), {
        timeout: SETTLE_TIMEOUT_MS,
      })
      .toBeLessThan(1)
  },
)

Then(
  'the {string} heading is fully visible and in its final position',
  async ({ page }, family: string) => {
    await expectFinalState(heading(page, family))
  },
)

Then(
  'the finale heading, message and signature are fully visible and in their final position',
  async ({ page }) => {
    const region = finale(page)
    for (const part of [
      region.getByRole('heading'),
      ...(await region.getByRole('paragraph').all()),
    ]) {
      await expect(part).toBeInViewport({ ratio: 1 })
      await expectFinalState(part)
    }
  },
)

const opacitiesInTheMiddle = new WeakMap<Page, number[]>()

When(
  'I scroll each family section and the finale to the middle of the viewport',
  async ({ page }) => {
    const targets = page.locator('[data-reveal]')
    const opacities: number[] = []
    for (const target of await targets.all()) {
      await scrollTopTo(target, 0.5)
      await expect
        .poll(() => opacityOf(target), { timeout: SETTLE_TIMEOUT_MS })
        .toBe(1)
        .catch(() => {})
      opacities.push(await opacityOf(target))
    }
    expect(opacities.length).toBeGreaterThan(0)
    opacitiesInTheMiddle.set(page, opacities)
  },
)

Then(
  'each of their headings, messages and authors is fully opaque',
  async ({ page }) => {
    expect(
      opacitiesInTheMiddle.get(page)!.every((opacity) => opacity === 1),
    ).toBe(true)
  },
)

Then(
  'every family heading, message and author and the finale are in the accessibility tree',
  async ({ page }) => {
    const tree = await page.locator('main').ariaSnapshot()
    const texts = await page
      .locator('[data-reveal], [data-reveal] figcaption, [data-reveal] p')
      .allInnerTexts()
    expect(texts.length).toBeGreaterThan(0)
    for (const text of texts) {
      for (const line of text.split('\n').filter(Boolean)) {
        expect(tree).toContain(line)
      }
    }
  },
)
