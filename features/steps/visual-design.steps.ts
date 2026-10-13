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

const HEADINGS = 'h1, h2'
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
  const edges = await page.locator('main, main *').evaluateAll((elements) =>
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
    const { left, right, width, viewport } = await page
      .locator('main')
      .evaluate((main) => {
        const box = main.getBoundingClientRect()
        return {
          left: box.left,
          right: box.right,
          width: box.width,
          viewport: document.documentElement.clientWidth,
        }
      })
    expect(width).toBeLessThanOrEqual(720)
    expect(Math.abs(left - (viewport - right))).toBeLessThanOrEqual(1)
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
