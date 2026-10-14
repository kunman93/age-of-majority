/// <reference lib="dom" />
import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { intro, waitUntilIntroIsTyped } from '../support/intro.ts'
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

const INTRO = '[data-intro]'
const TYPED = '[data-intro] [data-typed-text]'
const CURSOR = '[data-intro] [data-cursor]'

const typedLength = (page: Page) =>
  page.locator(TYPED).evaluate((typed) => typed.textContent!.length)

const fullLength = (page: Page) =>
  page.locator(`${INTRO} .sr-only`).evaluate((full) => full.textContent!.length)

const waitUntilTypingStarted = (page: Page) =>
  expect
    .poll(() => typedLength(page), { timeout: SETTLE_TIMEOUT_MS })
    .toBeGreaterThan(0)

When('I wait until the intro is fully typed', async ({ page }) => {
  await waitUntilIntroIsTyped(page)
})

Then('the intro is typed out', async ({ page }) => {
  await waitUntilTypingStarted(page)
  expect(await typedLength(page)).toBeLessThan(await fullLength(page))
  await waitUntilIntroIsTyped(page)
})

Then(
  'shortly after load only the first part of the intro is visible',
  async ({ page }) => {
    await waitUntilTypingStarted(page)
    expect(await typedLength(page)).toBeLessThan(await fullLength(page))
  },
)

Then('a blinking cursor follows the last typed character', async ({ page }) => {
  const sampled = new Set<string>()
  for (let i = 0; i < 12; i++) {
    sampled.add(
      await page
        .locator(CURSOR)
        .evaluate((cursor) => getComputedStyle(cursor).opacity),
    )
    await page.waitForTimeout(100)
  }
  expect(sampled).toContain('0')
  expect(sampled).toContain('1')

  const gap = await page.evaluate(
    ([typedSelector, cursorSelector]) => {
      const typed = document.querySelector(typedSelector)!
      const range = document.createRange()
      range.selectNodeContents(typed)
      const rects = range.getClientRects()
      const last = rects[rects.length - 1]
      const bar = document.querySelector(cursorSelector)!.firstElementChild!
      const { left } = bar.getBoundingClientRect()
      return {
        dx: Math.abs(left - last.right),
        dy: Math.abs(bar.getBoundingClientRect().bottom - last.bottom),
      }
    },
    [TYPED, CURSOR],
  )
  expect(gap.dx).toBeLessThanOrEqual(3)
  expect(gap.dy).toBeLessThanOrEqual(page.viewportSize()!.height / 10)
})

Then('the full intro is visible', async ({ page }) => {
  const typed = page.locator(TYPED)
  await expect(typed).toBeVisible()
  expect(await typedLength(page)).toBe(await fullLength(page))
  expect(await opacityOf(page.locator(INTRO))).toBe(1)
})

Then('a few seconds later no cursor is visible', async ({ page }) => {
  await expect
    .poll(() => opacityOf(page.locator(CURSOR)), { timeout: SETTLE_TIMEOUT_MS })
    .toBe(0)
})

Then(
  'the accessible text of the intro is the full intro, while it is still being typed',
  async ({ page }) => {
    const full = await page.locator(`${INTRO} .sr-only`).innerText()
    expect(await typedLength(page)).toBeLessThan(full.length)
    expect(await page.locator(INTRO).ariaSnapshot()).toContain(full)
  },
)

Then('the cursor is hidden from assistive technology', async ({ page }) => {
  const hidden = await page
    .locator(CURSOR)
    .evaluate((cursor) => cursor.closest('[aria-hidden="true"]') !== null)
  expect(hidden).toBe(true)
})

const greetingPositions = new WeakMap<Page, number>()

When('I remember where the greeting is', async ({ page }) => {
  await waitUntilTypingStarted(page)
  greetingPositions.set(
    page,
    (await page.getByRole('heading', { level: 1 }).boundingBox())!.y,
  )
})

Then('the greeting is where it was', async ({ page }) => {
  const box = await page.getByRole('heading', { level: 1 }).boundingBox()
  expect(box!.y).toBe(greetingPositions.get(page))
})

When('the intro is partly typed', async ({ page }) => {
  await waitUntilTypingStarted(page)
})

Then('the full intro is shown at once', async ({ page }) => {
  await waitUntilIntroIsTyped(page)
  expect(await typedLength(page)).toBe(await fullLength(page))
  expect(await opacityOf(page.locator(CURSOR))).toBe(0)
})

When(
  'I scroll until the {string} heading just enters the viewport',
  async ({ page }, family: string) => {
    await scrollTopTo(heading(page, family), 1, -1)
  },
)

When(
  'I scroll until the finale heading just enters the viewport',
  async ({ page }) => {
    await scrollTopTo(finale(page).getByRole('heading'), 1, -1)
  },
)

const expectStillAndVisible = async (locator: Locator) => {
  expect(await opacityOf(locator)).toBe(1)
  expect(await offsetYOf(locator)).toBe(0)
}

Then(
  'the {string} heading is fully visible without moving',
  async ({ page }, family: string) => {
    await expectStillAndVisible(heading(page, family))
  },
)

Then('the finale heading is fully visible without moving', async ({ page }) => {
  await expectStillAndVisible(finale(page).getByRole('heading'))
})
