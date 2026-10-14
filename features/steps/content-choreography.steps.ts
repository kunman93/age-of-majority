/// <reference lib="dom" />
import { expect, type Locator, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  intro,
  introState,
  sentenceLine,
  waitUntilIntro,
  waitUntilPartlyTyped,
} from '../support/intro.ts'
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
  await expect(page.locator('[data-intro] [data-full-text]')).toBeVisible()
  await expect(page.locator('[data-intro] [data-full-text]')).toHaveText(
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
const CURSOR = '[data-intro] [data-cursor]'
const SENTENCES = [
  'Today you come of age.',
  'This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you.',
  'Scroll on and read what they have to say.',
]
const LOOP_TEST_TIMEOUT_MS = 60000

When('I wait until the first sentence is fully typed', async ({ page }) => {
  await waitUntilIntro(page, { sentence: 0, phase: 'shown' })
})

Then('the intro is typed out', async ({ page }) => {
  await waitUntilPartlyTyped(page, 0)
})

Then(
  'shortly after load only the first part of the first sentence is visible',
  async ({ page }) => {
    await waitUntilPartlyTyped(page, 0)
  },
)

Then('a blinking cursor follows the last typed character', async ({ page }) => {
  const sampled = new Set<string>()
  for (let i = 0; i < 12; i++) {
    sampled.add(
      await sentenceLine(page, 0)
        .locator('[data-cursor]')
        .evaluate((cursor) => getComputedStyle(cursor).opacity),
    )
    await page.waitForTimeout(100)
  }
  expect(sampled).toContain('0')
  expect(sampled).toContain('1')

  const gap = await sentenceLine(page, 0).evaluate((line) => {
    const typed = line.querySelector('[data-typed-text]')!
    const range = document.createRange()
    range.selectNodeContents(typed)
    const rects = range.getClientRects()
    const last = rects[rects.length - 1]
    const bar = line.querySelector('[data-cursor]')!.firstElementChild!
    const { left, bottom } = bar.getBoundingClientRect()
    return {
      dx: Math.abs(left - last.right),
      dy: Math.abs(bottom - last.bottom),
    }
  })
  expect(gap.dx).toBeLessThanOrEqual(3)
  expect(gap.dy).toBeLessThanOrEqual(page.viewportSize()!.height / 10)
})

Then(
  'the first sentence is visible and no other sentence is visible',
  async ({ page }) => {
    expect((await introState(page)).typedText).toBe(SENTENCES[0])
    expect(await opacityOf(sentenceLine(page, 0))).toBe(1)
    for (const index of [1, 2]) {
      expect(await opacityOf(sentenceLine(page, index))).toBe(0)
    }
  },
)

When('I wait a few seconds longer', async ({ page }) => {
  await waitUntilPartlyTyped(page, 1)
})

Then(
  'the second sentence is being typed in place of the first',
  async ({ page }) => {
    expect(await opacityOf(sentenceLine(page, 1))).toBe(1)
    expect(await opacityOf(sentenceLine(page, 0))).toBe(0)
    const [first, second] = await Promise.all(
      [0, 1].map((index) => sentenceLine(page, index).boundingBox()),
    )
    expect(second!.x).toBe(first!.x)
    expect(second!.y).toBe(first!.y)
  },
)

When(
  'I wait until the last sentence of the intro has been typed and erased',
  async ({ page, $test }) => {
    $test.setTimeout(LOOP_TEST_TIMEOUT_MS)
    await waitUntilIntro(page, { sentence: 2, phase: 'erasing' })
    await waitUntilIntro(page, { sentence: 0, phase: 'typing' })
  },
)

Then('the first sentence is typed again', async ({ page }) => {
  await waitUntilPartlyTyped(page, 0)
})

Then(
  'the accessible text of the intro is the full intro, while its sentences are typed',
  async ({ page }) => {
    await waitUntilPartlyTyped(page, 0)
    const full = await page.locator(`${INTRO} .sr-only`).innerText()
    expect(full).toBe(SENTENCES.join(' '))
    expect(await page.locator(INTRO).ariaSnapshot()).toContain(full)
  },
)

Then('the cursor is hidden from assistive technology', async ({ page }) => {
  const cursors = await page.locator(CURSOR).all()
  expect(cursors.length).toBeGreaterThan(0)
  for (const cursor of cursors) {
    expect(
      await cursor.evaluate(
        (element) => element.closest('[aria-hidden="true"]') !== null,
      ),
    ).toBe(true)
  }
})

const greetingPositions = new WeakMap<Page, number>()
const greetingY = async (page: Page) =>
  (await page.getByRole('heading', { level: 1 }).boundingBox())!.y

When('I remember where the greeting is', async ({ page }) => {
  await waitUntilPartlyTyped(page, 0)
  greetingPositions.set(page, await greetingY(page))
})

Then(
  'the greeting is where it was while each sentence is fully typed',
  async ({ page, $test }) => {
    $test.setTimeout(LOOP_TEST_TIMEOUT_MS)
    for (const sentence of [0, 1, 2]) {
      await waitUntilIntro(page, { sentence, phase: 'shown' })
      expect(await greetingY(page)).toBe(greetingPositions.get(page))
    }
  },
)

When('the intro is partly typed', async ({ page }) => {
  await waitUntilPartlyTyped(page, 0)
})

When('the second sentence is partly typed', async ({ page }) => {
  await waitUntilPartlyTyped(page, 1)
})

Then('the full intro is shown at once', async ({ page }) => {
  await expect(intro(page)).toHaveAttribute('data-typed', 'done')
  await expect(page.locator(`${INTRO} [data-full-text]`)).toHaveText(
    SENTENCES.join(' '),
  )
  for (const cursor of await page.locator(CURSOR).all()) {
    await expect(cursor).toBeHidden()
  }
})

When('I scroll until the opening is out of the viewport', async ({ page }) => {
  await page
    .locator(OPENING)
    .evaluate((opening) => window.scrollTo(0, opening.clientHeight + 1))
})

const introSnapshots = new WeakMap<Page, string>()
const snapshotOf = async (page: Page) => {
  const { sentence, typedText } = await introState(page)
  return `${sentence}:${typedText}`
}

Then('the visible intro text no longer changes', async ({ page }) => {
  await page.waitForTimeout(500)
  const snapshot = await snapshotOf(page)
  await page.waitForTimeout(1500)
  expect(await snapshotOf(page)).toBe(snapshot)
  introSnapshots.set(page, snapshot)
})

Then('the intro is typed on', async ({ page }) => {
  await expect
    .poll(() => snapshotOf(page), { timeout: SETTLE_TIMEOUT_MS })
    .not.toBe(introSnapshots.get(page))
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

const firstCard = (page: Page, family: string) =>
  section(page, family).getByRole('figure').first()

const cardSlots = (page: Page, family: string) =>
  section(page, family).getByRole('figure').locator('..')

const slideOffsetOf = (slot: Locator) =>
  slot.evaluate((element) => {
    const { transform } = getComputedStyle(element)
    return transform === 'none' ? 0 : new DOMMatrix(transform).m41
  })

When(
  'I scroll until the top of the first {string} message card just enters the viewport from below',
  async ({ page }, family: string) => {
    await scrollTopTo(cardSlots(page, family).first(), 1, -1)
  },
)

When(
  'I scroll until both {string} message cards are in the upper half of the viewport',
  async ({ page }, family: string) => {
    await scrollTopTo(cardSlots(page, family).first(), 0.25)
  },
)

Then(
  'the two {string} message cards are shifted sideways from their places, in opposite directions',
  async ({ page }, family: string) => {
    const slots = await cardSlots(page, family).all()
    expect(slots).toHaveLength(2)
    await expect
      .poll(async () => {
        const [first, second] = await Promise.all(slots.map(slideOffsetOf))
        return (
          first !== 0 && second !== 0 && Math.sign(first) !== Math.sign(second)
        )
      })
      .toBe(true)
  },
)

Then('neither card is fully visible', async ({ page }) => {
  for (const slot of await cardSlots(page, 'Family Ipsum').all()) {
    await expect
      .poll(() => opacityOf(slot), { timeout: SETTLE_TIMEOUT_MS })
      .toBeLessThan(1)
  }
})

Then(
  'both {string} message cards are fully visible and in their final positions',
  async ({ page }, family: string) => {
    for (const slot of await cardSlots(page, family).all()) {
      await expect
        .poll(() => opacityOf(slot), { timeout: SETTLE_TIMEOUT_MS })
        .toBe(1)
      await expect
        .poll(() => slideOffsetOf(slot), { timeout: SETTLE_TIMEOUT_MS })
        .toBe(0)
    }
  },
)

type HoverState = { tilt: number; pin: { x: number; y: number } }
const beforeHover = new WeakMap<Page, HoverState>()

const tiltOf = (card: Locator) =>
  card.evaluate((element) => parseFloat(getComputedStyle(element).rotate))

// The pin is the one point a card tilts around, so it is derived from the
// rotated box: the box's center sits half the card's height below the pin
const pinOf = (card: Locator) =>
  card.evaluate((element) => {
    const { rotate } = getComputedStyle(element)
    const radians = (parseFloat(rotate) * Math.PI) / 180
    const box = element.getBoundingClientRect()
    const half = (element as HTMLElement).offsetHeight / 2
    return {
      x: box.left + box.width / 2 + Math.sin(radians) * half,
      y: box.top + box.height / 2 - Math.cos(radians) * half,
    }
  })

When(
  'I scroll the first {string} message card into place and remember its tilt and pin',
  async ({ page }, family: string) => {
    const card = firstCard(page, family)
    await scrollTopTo(card, 0.3)
    const slot = card.locator('..')
    await expect
      .poll(() => opacityOf(slot), { timeout: SETTLE_TIMEOUT_MS })
      .toBe(1)
    await expect
      .poll(
        () =>
          slot.evaluate((element) => {
            const { transform } = getComputedStyle(element)
            const { m41, m42 } = new DOMMatrix(
              transform === 'none' ? undefined : transform,
            )
            return Math.abs(m41) + Math.abs(m42)
          }),
        { timeout: SETTLE_TIMEOUT_MS },
      )
      .toBe(0)
    beforeHover.set(page, { tilt: await tiltOf(card), pin: await pinOf(card) })
  },
)

When('I move the pointer over the card', async ({ page }) => {
  await firstCard(page, 'Family Ipsum').hover()
})

When('I move the pointer away from the card', async ({ page }) => {
  await page.mouse.move(0, 0)
})

const MAX_TILT_DEGREES = 2
const PIN_TOLERANCE_PX = 1

Then(
  'the card is tilted in the opposite direction from before, by at most 2 degrees',
  async ({ page }) => {
    const { tilt } = beforeHover.get(page)!
    const card = firstCard(page, 'Family Ipsum')
    await expect.poll(() => tiltOf(card)).toBeCloseTo(-tilt, 1)
    expect(Math.abs(await tiltOf(card))).toBeLessThanOrEqual(MAX_TILT_DEGREES)
  },
)

Then('its pin is at the same position as before', async ({ page }) => {
  const { pin } = beforeHover.get(page)!
  const now = await pinOf(firstCard(page, 'Family Ipsum'))
  expect(Math.abs(now.x - pin.x)).toBeLessThanOrEqual(PIN_TOLERANCE_PX)
  expect(Math.abs(now.y - pin.y)).toBeLessThanOrEqual(PIN_TOLERANCE_PX)
})

Then('the card is back at its original tilt', async ({ page }) => {
  const { tilt } = beforeHover.get(page)!
  await expect
    .poll(() => tiltOf(firstCard(page, 'Family Ipsum')))
    .toBeCloseTo(tilt, 1)
})

Then('the card keeps its original tilt', async ({ page }) => {
  const { tilt } = beforeHover.get(page)!
  await page.waitForTimeout(500)
  expect(await tiltOf(firstCard(page, 'Family Ipsum'))).toBeCloseTo(tilt, 1)
})
