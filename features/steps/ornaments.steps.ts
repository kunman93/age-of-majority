/// <reference lib="dom" />
import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { intro, waitUntilPartlyTyped } from '../support/intro.ts'
import { scrollTopTo } from '../support/scroll.ts'

const { When, Then } = createBdd()

const ORNAMENT = '[data-ornament]'
const SETTLE_TIMEOUT_MS = 10000
// Observation window that proves nothing moves, not a wait to reach a state
const NO_DRIFT_WINDOW_MS = 1500
const SCROLL_A_LITTLE_PX = 400

const greeting = (page: Page) => page.getByRole('heading', { level: 1 })

const countInViewport = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const { top, bottom, left, right } = element.getBoundingClientRect()
        return (
          bottom > 0 &&
          top < window.innerHeight &&
          right > 0 &&
          left < window.innerWidth
        )
      }).length,
  )

Then('ornaments are shown in the first screen', async ({ page }) => {
  await expect
    .poll(() => countInViewport(page, `[data-opening] ${ORNAMENT}`))
    .toBeGreaterThan(0)
})

Then('no ornament is an image', async ({ page }) => {
  expect(await page.locator(ORNAMENT).count()).toBeGreaterThan(0)
  expect(await page.locator('[data-ornaments] img').count()).toBe(0)
})

When('I scroll to the showcase', async ({ page }) => {
  await scrollTopTo(page.locator('[data-showcase]').first(), 0)
})

Then(
  'ornaments are shown in the viewport next to the showcase',
  async ({ page }) => {
    await expect
      .poll(() => countInViewport(page, `[data-showcase] ${ORNAMENT}`))
      .toBeGreaterThan(0)
  },
)

const compositionOf = (page: Page, scope: string) =>
  page
    .locator(`${scope} [data-ornaments]`)
    .first()
    .evaluate((layer) =>
      [...layer.querySelectorAll('[data-ornament]')]
        .map((piece) => piece.parentElement!.getAttribute('style'))
        .join('|'),
    )

Then(
  'the showcase shows a different ornament composition than the opening',
  async ({ page }) => {
    const opening = await compositionOf(page, '[data-opening]')
    const showcase = await compositionOf(page, '[data-showcase]')
    expect(opening).not.toBe('')
    expect(showcase).not.toBe('')
    expect(showcase).not.toBe(opening)
  },
)

Then('no ornament is in the accessibility tree', async ({ page }) => {
  const pieces = await page.locator(ORNAMENT).all()
  expect(pieces.length).toBeGreaterThan(0)
  for (const piece of pieces) {
    expect(
      await piece.evaluate(
        (element) => element.closest('[aria-hidden="true"]') !== null,
      ),
    ).toBe(true)
  }
  expect(await page.locator('main').ariaSnapshot()).not.toContain('img')
})

When(
  'the greeting and the first sentence of the intro are shown',
  async ({ page }) => {
    await waitUntilPartlyTyped(page, 0)
  },
)

Then('no ornament overlaps the greeting or the intro', async ({ page }) => {
  const texts = [
    (await greeting(page).boundingBox())!,
    (await intro(page).boundingBox())!,
  ]
  const pieces = await page.locator(`[data-opening] ${ORNAMENT}`).all()
  expect(pieces.length).toBeGreaterThan(0)
  for (const piece of pieces) {
    const box = (await piece.boundingBox())!
    for (const text of texts) {
      const overlaps =
        box.x < text.x + text.width &&
        box.x + box.width > text.x &&
        box.y < text.y + text.height &&
        box.y + box.height > text.y
      expect(overlaps).toBe(false)
    }
  }
})

// Relative to its own composition, so only the ornament's own motion counts and
// not the text above it settling when the web fonts load
const placesInTheirCompositions = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-opening] [data-ornament]')].map(
      (piece) =>
        piece.getBoundingClientRect().top -
        piece.parentElement!.parentElement!.getBoundingClientRect().top,
    ),
  )

const placesBefore = new WeakMap<Page, number[]>()

When('I remember where the ornaments are', async ({ page }) => {
  placesBefore.set(page, await placesInTheirCompositions(page))
})

When('I scroll down a little', async ({ page }) => {
  await page.evaluate((y) => window.scrollTo(0, y), SCROLL_A_LITTLE_PX)
})

const moved = async (page: Page) => {
  const before = placesBefore.get(page)!
  const now = await placesInTheirCompositions(page)
  return now.some((place, index) => Math.abs(place - before[index]) > 0.5)
}

Then('at least one ornament has moved', async ({ page }) => {
  await expect
    .poll(() => moved(page), { timeout: SETTLE_TIMEOUT_MS })
    .toBe(true)
})

Then('no ornament has moved', async ({ page }) => {
  await page.waitForTimeout(NO_DRIFT_WINDOW_MS)
  expect(await moved(page)).toBe(false)
})
