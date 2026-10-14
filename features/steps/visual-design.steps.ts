/// <reference lib="dom" />
import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  contrastRatio,
  hue,
  parseRgb,
  relativeLuminance,
  saturation,
  type Rgba,
} from '../support/color.ts'

const { Given, Then } = createBdd()

const HEADINGS = 'h1, h2, h3'
const BODY_TEXT = 'main p, main figcaption'
const MESSAGE_AND_INTRO = 'main p'

type TextStyle = {
  color: string
  background: string
  fontFamily: string
  fontSize: number
}

const readTextStyles = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((elements): TextStyle[] => {
    const backgroundBehind = (element: Element) => {
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        const { backgroundColor } = getComputedStyle(node)
        if (backgroundColor !== 'rgba(0, 0, 0, 0)') return backgroundColor
      }
      return 'rgb(255, 255, 255)'
    }
    return elements.map((element) => {
      const style = getComputedStyle(element)
      return {
        color: style.color,
        background: backgroundBehind(element),
        fontFamily: style.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
        fontSize: parseFloat(style.fontSize),
      }
    })
  })

const isWarm = (color: Rgba) => hue(color) <= 60 || hue(color) >= 340

Then('the page background is dark and warm', async ({ page }) => {
  const [{ background }] = await readTextStyles(page, 'h1')
  const color = parseRgb(background)
  expect(relativeLuminance(color)).toBeLessThan(0.05)
  expect(isWarm(color)).toBe(true)
})

Then(
  'the intro, the messages and the finale message are light',
  async ({ page }) => {
    const styles = await readTextStyles(page, MESSAGE_AND_INTRO)
    expect(styles.length).toBeGreaterThan(0)
    for (const { color } of styles) {
      expect(relativeLuminance(parseRgb(color))).toBeGreaterThan(0.5)
    }
  },
)

Then(
  'the greeting, the family headings and the finale heading are red, orange or yellow',
  async ({ page }) => {
    const styles = await readTextStyles(page, HEADINGS)
    expect(styles.length).toBeGreaterThan(0)
    for (const { color } of styles) {
      const rgb = parseRgb(color)
      expect(isWarm(rgb)).toBe(true)
      expect(saturation(rgb)).toBeGreaterThan(0.5)
    }
  },
)

Then('the display and body fonts are loaded', async ({ page }) => {
  await page.evaluate(() => document.fonts.ready)
  for (const family of ['Fraunces Variable', 'Nunito Variable']) {
    await expect
      .poll(() =>
        page.evaluate(
          (name) =>
            [...document.fonts].some(
              (face) =>
                face.family.replace(/["']/g, '') === name &&
                face.status === 'loaded',
            ),
          family,
        ),
      )
      .toBe(true)
  }
})

Then('all headings use the same typeface', async ({ page }) => {
  const families = new Set(
    (await readTextStyles(page, HEADINGS)).map((s) => s.fontFamily),
  )
  expect(families.size).toBe(1)
})

Then(
  'all other text uses one typeface that differs from the headings',
  async ({ page }) => {
    const [heading] = await readTextStyles(page, HEADINGS)
    const families = new Set(
      (await readTextStyles(page, BODY_TEXT)).map((s) => s.fontFamily),
    )
    expect(families.size).toBe(1)
    expect(families).not.toContain(heading.fontFamily)
  },
)

const requestUrls = new WeakMap<Page, { url: string; type: string }[]>()

Given('I record the requests the page makes', async ({ page }) => {
  const requests: { url: string; type: string }[] = []
  page.on('request', (request) =>
    requests.push({ url: request.url(), type: request.resourceType() }),
  )
  requestUrls.set(page, requests)
})

Then('the page loaded fonts', async ({ page }) => {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  const fonts = requestUrls.get(page)!.filter((r) => r.type === 'font')
  expect(fonts.length).toBeGreaterThan(0)
})

Then("every request goes to the card's own origin", async ({ page }) => {
  const origin = new URL(page.url()).origin
  for (const { url } of requestUrls.get(page)!) {
    expect(new URL(url).origin).toBe(origin)
  }
})

Given('a {int}px wide window', async ({ page }, width: number) => {
  await page.setViewportSize({ width, height: 800 })
})

Then('the page does not scroll horizontally', async ({ page }) => {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(0)
})

Then('all content fits within the window width', async ({ page }) => {
  const edges = await page
    .locator('main, main *:not([data-cake-halo])')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const { left, right } = element.getBoundingClientRect()
        return { left, right }
      }),
    )
  const width = page.viewportSize()!.width
  for (const { left, right } of edges) {
    expect(left).toBeGreaterThanOrEqual(0)
    expect(right).toBeLessThanOrEqual(width)
  }
})

Then(
  'the content column is centered and no wider than 720px',
  async ({ page }) => {
    const columns = await page
      .locator('main > header, main > [data-showcase], main > [data-reveal]')
      .evaluateAll((elements) =>
        elements.map((column) => {
          const box = column.getBoundingClientRect()
          return {
            left: box.left,
            right: box.right,
            width: box.width,
            viewport: document.documentElement.clientWidth,
          }
        }),
      )
    expect(columns).toHaveLength(3)
    for (const { left, right, width, viewport } of columns) {
      expect(width).toBeLessThanOrEqual(720)
      expect(Math.abs(left - (viewport - right))).toBeLessThanOrEqual(1)
    }
  },
)

Then('all body text is at least 16px', async ({ page }) => {
  const styles = await readTextStyles(page, BODY_TEXT)
  expect(styles.length).toBeGreaterThan(0)
  for (const { fontSize } of styles) expect(fontSize).toBeGreaterThanOrEqual(16)
})

Then(
  'every text has a contrast ratio of at least 4.5 against its background',
  async ({ page }) => {
    const styles = await readTextStyles(page, `${HEADINGS}, ${BODY_TEXT}`)
    expect(styles.length).toBeGreaterThan(0)
    for (const { color, background } of styles) {
      expect(
        contrastRatio(parseRgb(color), parseRgb(background)),
      ).toBeGreaterThanOrEqual(4.5)
    }
  },
)

Then('no element animates or transitions', async ({ page }) => {
  const moving = await page
    .locator('html, body, body *')
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element)
          const transitions = style.transitionDuration
            .split(',')
            .some((duration) => parseFloat(duration) > 0)
          return style.animationName !== 'none' || transitions
        })
        .map((element) => element.tagName),
    )
  expect(moving).toEqual([])
})

const MAX_TILT_DEGREES = 2

const CENTER_TOLERANCE_PX = 1

Then(
  'every message card has a tape strip at the middle of its top edge, with a pin through its middle',
  async ({ page }) => {
    const decorations = await page.getByRole('figure').evaluateAll((cards) =>
      cards.map((card) => {
        const read = (pseudo: '::before' | '::after') => {
          const { content, position, top, left, width, height, ...style } =
            getComputedStyle(card, pseudo)
          return {
            content,
            position,
            top: parseFloat(top),
            height: parseFloat(height),
            centerX: parseFloat(left) + parseFloat(width) / 2,
            centerY: parseFloat(top) + parseFloat(height) / 2,
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
          }
        }
        return {
          cardCenterX: (card as HTMLElement).offsetWidth / 2,
          tape: read('::before'),
          pin: read('::after'),
        }
      }),
    )
    expect(decorations.length).toBeGreaterThan(0)
    for (const { cardCenterX, tape, pin } of decorations) {
      for (const part of [tape, pin]) {
        expect(part.content).not.toBe('none')
        expect(part.position).toBe('absolute')
        expect(part.top).toBeLessThanOrEqual(0)
        expect(part.top + part.height).toBeGreaterThan(0)
        expect(Math.abs(part.centerX - cardCenterX)).toBeLessThanOrEqual(
          CENTER_TOLERANCE_PX,
        )
      }
      expect(parseRgb(tape.backgroundColor).a).toBeGreaterThan(0)
      expect(pin.backgroundImage).not.toBe('none')
      expect(Math.abs(pin.centerY - tape.centerY)).toBeLessThanOrEqual(
        tape.height / 2,
      )
    }
  },
)

Then('every message card is tilted around its pin', async ({ page }) => {
  const pivots = await page.getByRole('figure').evaluateAll((cards) =>
    cards.map((card) => {
      const [x, y] = getComputedStyle(card)
        .transformOrigin.split(' ')
        .map(parseFloat)
      return { x, y, centerX: (card as HTMLElement).offsetWidth / 2 }
    }),
  )
  expect(pivots.length).toBeGreaterThan(0)
  for (const { x, y, centerX } of pivots) {
    expect(Math.abs(x - centerX)).toBeLessThanOrEqual(CENTER_TOLERANCE_PX)
    expect(y).toBe(0)
  }
})

Then('every message card is at least 400px wide', async ({ page }) => {
  const widths = await page
    .getByRole('figure')
    .evaluateAll((cards) => cards.map((card) => card.clientWidth))
  expect(widths.length).toBeGreaterThan(0)
  for (const width of widths) expect(width).toBeGreaterThanOrEqual(400)
})

const BOARD = '[data-board]'

Then(
  'every family heading and every message card is inside one board',
  async ({ page }) => {
    await expect(page.locator(BOARD)).toHaveCount(1)
    const outside = await page
      .locator(BOARD)
      .evaluate(
        (board) =>
          [...document.querySelectorAll('main h3, main figure')].filter(
            (element) => !board.contains(element),
          ).length,
      )
    expect(outside).toBe(0)
    await expect(page.locator(`${BOARD} figure`)).not.toHaveCount(0)
    await expect(page.locator(`${BOARD} h3`)).not.toHaveCount(0)
  },
)

Then(
  'the heading {string} is above the board',
  async ({ page }, name: string) => {
    const heading = await page
      .getByRole('heading', { level: 2, name, exact: true })
      .boundingBox()
    const board = await page.locator(BOARD).boundingBox()
    expect(heading!.y + heading!.height).toBeLessThanOrEqual(board!.y)
  },
)

Then('the board contains no image', async ({ page }) => {
  const images = await page.locator(BOARD).evaluate((board) => ({
    elements: board.querySelectorAll('img, picture, svg, canvas, video').length,
    files: [board, ...board.querySelectorAll('*')].filter((element) =>
      getComputedStyle(element).backgroundImage.includes('url('),
    ).length,
  }))
  expect(images).toEqual({ elements: 0, files: 0 })
})

Then('the board fits within the window width', async ({ page }) => {
  const { left, right } = await page
    .locator(BOARD)
    .evaluate((board) => board.getBoundingClientRect())
  expect(left).toBeGreaterThanOrEqual(0)
  expect(right).toBeLessThanOrEqual(page.viewportSize()!.width)
})

Then(
  'consecutive message cards are tilted in opposite directions by at most 2 degrees',
  async ({ page }) => {
    const tilts = await page
      .getByRole('figure')
      .evaluateAll((cards) =>
        cards.map((card) => parseFloat(getComputedStyle(card).rotate)),
      )
    expect(tilts.length).toBeGreaterThan(1)
    for (const tilt of tilts) {
      expect(Math.abs(tilt)).toBeGreaterThan(0)
      expect(Math.abs(tilt)).toBeLessThanOrEqual(MAX_TILT_DEGREES)
    }
    tilts
      .slice(1)
      .forEach((tilt, i) => expect(Math.sign(tilt)).toBe(-Math.sign(tilts[i])))
  },
)

Then('no message card contains an image', async ({ page }) => {
  const images = await page
    .getByRole('figure')
    .evaluateAll(
      (cards) =>
        cards.filter(
          (card) =>
            card.querySelector('img, picture, svg, canvas, video') !== null ||
            getComputedStyle(card).backgroundImage !== 'none',
        ).length,
    )
  expect(images).toBe(0)
})

// The cards' wrappers are measured because the tilt moves the cards' own corners
const familyCardSlots = async (page: Page, family: string) => {
  const slots = await page
    .getByRole('region', { name: family })
    .getByRole('figure')
    .evaluateAll((cards) =>
      cards.map((card) => {
        const { left, top, right, bottom } =
          card.parentElement!.getBoundingClientRect()
        return { left, top, right, bottom }
      }),
    )
  expect(slots).toHaveLength(2)
  return slots
}

Then(
  'the two {string} message cards are side by side, with their tops at the same height',
  async ({ page }, family: string) => {
    const [first, second] = await familyCardSlots(page, family)
    expect(second.left).toBeGreaterThanOrEqual(first.right)
    expect(Math.abs(second.top - first.top)).toBeLessThanOrEqual(1)
  },
)

Then(
  'the two {string} message cards are stacked vertically',
  async ({ page }, family: string) => {
    const [first, second] = await familyCardSlots(page, family)
    expect(second.top).toBeGreaterThanOrEqual(first.bottom)
    expect(Math.abs(second.left - first.left)).toBeLessThanOrEqual(1)
  },
)

Then('every message card fits within the window width', async ({ page }) => {
  const width = page.viewportSize()!.width
  const edges = await page.getByRole('figure').evaluateAll((cards) =>
    cards.map((card) => {
      const { left, right } = card.getBoundingClientRect()
      return { left, right }
    }),
  )
  expect(edges.length).toBeGreaterThan(0)
  for (const { left, right } of edges) {
    expect(left).toBeGreaterThanOrEqual(0)
    expect(right).toBeLessThanOrEqual(width)
  }
})
