/// <reference lib="dom" />
import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  contrastRatio,
  parseRgb,
  relativeLuminance,
  type Rgba,
} from '../support/color.ts'
import { EMBER_CANVAS, holdRenderingContext } from '../support/canvases.ts'
import { countDifferingPixels } from '../support/screenshot.ts'

const { Given, When, Then } = createBdd()

const SCENE_CHUNK = /EmberCanvas|StoryCanvas|\/three|react-three/
const GLOW = '[data-testid="background-glow"]'
const TEXT = 'h1, h2, main p, main figcaption'

const requestUrls = new WeakMap<Page, string[]>()

Given('I record every request the page makes', async ({ page }) => {
  const urls: string[] = []
  page.on('request', (request) => urls.push(request.url()))
  requestUrls.set(page, urls)
})

Given('the visitor prefers reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

Given('the browser does not support WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null
      return (getContext as (...args: unknown[]) => unknown).call(
        this,
        type,
        ...rest,
      )
    } as typeof getContext
  })
})

Given(
  'the screen has a device pixel ratio of {int}',
  async ({ page, context }, ratio: number) => {
    const session = await context.newCDPSession(page)
    const { width, height } = page.viewportSize()!
    await session.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: ratio,
      mobile: false,
    })
  },
)

Given('I count the draw calls of the page', async ({ page }) => {
  await page.addInitScript(() => {
    const counter = window as unknown as { drawCalls: number }
    counter.drawCalls = 0
    for (const context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      for (const method of ['drawArrays', 'drawElements'] as const) {
        const original = context.prototype[method] as (
          ...args: unknown[]
        ) => void
        context.prototype[method] = function (
          this: unknown,
          ...args: unknown[]
        ) {
          counter.drawCalls += 1
          return original.apply(this, args)
        } as never
      }
    }
  })
})

const drawCalls = (page: Page) =>
  page.evaluate(() => (window as unknown as { drawCalls: number }).drawCalls)

const SETTLE_MS = 300

Then('the 3D scene is rendering', async ({ page }) => {
  const before = await drawCalls(page)
  await expect.poll(() => drawCalls(page)).toBeGreaterThan(before)
})

When('the page becomes hidden', async ({ page }) => {
  await page.evaluate(() => {
    for (const property of ['visibilityState', 'hidden']) {
      Object.defineProperty(document, property, {
        configurable: true,
        value: property === 'hidden' ? true : 'hidden',
      })
    }
    document.dispatchEvent(new Event('visibilitychange'))
  })
})

When('the page becomes visible', async ({ page }) => {
  await page.evaluate(() => {
    for (const property of ['visibilityState', 'hidden']) {
      Object.defineProperty(document, property, {
        configurable: true,
        value: property === 'hidden' ? false : 'visible',
      })
    }
    document.dispatchEvent(new Event('visibilitychange'))
  })
})

Then('the 3D scene stops rendering', async ({ page }) => {
  // let a frame that was already in flight finish
  await page.waitForTimeout(SETTLE_MS)
  const before = await drawCalls(page)
  await page.waitForTimeout(SETTLE_MS)
  expect(await drawCalls(page)).toBe(before)
})

Then('the greeting is shown', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

Then('the 3D scene was downloaded', async ({ page }) => {
  await expect
    .poll(() => requestUrls.get(page)!.some((url) => SCENE_CHUNK.test(url)))
    .toBe(true)
})

Then('the page did not download the 3D scene', async ({ page }) => {
  await page.waitForLoadState('networkidle')
  expect(requestUrls.get(page)!.filter((url) => SCENE_CHUNK.test(url))).toEqual(
    [],
  )
})

Then('no canvas is shown', async ({ page }) => {
  await page.waitForLoadState('networkidle')
  await expect(page.locator('canvas')).toHaveCount(0)
})

const coversViewport = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => {
    const { left, top, width, height } = element.getBoundingClientRect()
    return {
      left,
      top,
      width,
      height,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: window.innerHeight,
    }
  })

const expectToCoverViewport = async (page: Page, selector: string) => {
  const box = await coversViewport(page, selector)
  expect(box.left).toBe(0)
  expect(box.top).toBe(0)
  expect(box.width).toBe(box.viewportWidth)
  expect(box.height).toBe(box.viewportHeight)
  // pointer-events: none hides the background from hit testing, so make it
  // hit-testable to prove it is painted below the content
  const contentIsOnTop = await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent =
      '[aria-hidden="true"], [aria-hidden="true"] * { pointer-events: auto !important }'
    document.head.append(style)
    try {
      const visibleText = [...document.querySelectorAll('h1, h2, main p')].find(
        (element) => {
          const { top, bottom } = element.getBoundingClientRect()
          return top >= 0 && bottom <= window.innerHeight
        },
      )
      if (!visibleText) return false
      const { left, top, width, height } = visibleText.getBoundingClientRect()
      const hit = document.elementFromPoint(left + width / 2, top + height / 2)
      return hit !== null && visibleText.contains(hit)
    } finally {
      style.remove()
    }
  })
  expect(contentIsOnTop).toBe(true)
}

Then(
  'exactly one canvas covers the whole viewport behind the content',
  async ({ page }) => {
    await expect(page.locator(EMBER_CANVAS)).toHaveCount(1)
    await expectToCoverViewport(page, EMBER_CANVAS)
  },
)

Then(
  'the static glow covers the whole viewport behind the content',
  async ({ page }) => {
    await expect(page.locator(GLOW)).toHaveCount(1)
    await expectToCoverViewport(page, GLOW)
    const style = await page.locator(GLOW).evaluate((element) => {
      const { backgroundImage, animationName, transitionDuration } =
        getComputedStyle(element)
      return { backgroundImage, animationName, transitionDuration }
    })
    expect(style.backgroundImage).not.toBe('none')
    expect(style.animationName).toBe('none')
    expect(parseFloat(style.transitionDuration)).toBe(0)
  },
)

Then('the canvas is hidden from assistive technology', async ({ page }) => {
  const hidden = await page
    .locator(EMBER_CANVAS)
    .evaluate((canvas) => canvas.closest('[aria-hidden="true"]') !== null)
  expect(hidden).toBe(true)
})

Then('the canvas does not catch pointer input', async ({ page }) => {
  const pointerEvents = await page
    .locator(EMBER_CANVAS)
    .evaluate((canvas) => getComputedStyle(canvas).pointerEvents)
  expect(pointerEvents).toBe('none')
})

Then(
  'the canvas has at most {int} device pixels per CSS pixel',
  async ({ page }, maximum: number) => {
    const ratio = await page.locator(EMBER_CANVAS).evaluate((canvas) => ({
      horizontal: (canvas as HTMLCanvasElement).width / canvas.clientWidth,
      vertical: (canvas as HTMLCanvasElement).height / canvas.clientHeight,
    }))
    expect(ratio.horizontal).toBeLessThanOrEqual(maximum)
    expect(ratio.vertical).toBeLessThanOrEqual(maximum)
  },
)

const brightestPixel = (page: Page, screenshot: Buffer) =>
  page.evaluate(async (base64): Promise<Rgba> => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    const linear = (value: number) => {
      const c = value / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    let best = { r: 0, g: 0, b: 0, a: 1 }
    let bestLuminance = -1
    for (let i = 0; i < data.length; i += 4) {
      const luminance =
        0.2126 * linear(data[i]) +
        0.7152 * linear(data[i + 1]) +
        0.0722 * linear(data[i + 2])
      if (luminance > bestLuminance) {
        bestLuminance = luminance
        best = { r: data[i], g: data[i + 1], b: data[i + 2], a: 1 }
      }
    }
    return best
  }, screenshot.toString('base64'))

Then(
  'every text has a contrast ratio of at least {float} against the brightest pixel of the background',
  async ({ page }, minimum: number) => {
    const colors = await page
      .locator(TEXT)
      .evaluateAll((elements) => elements.map((e) => getComputedStyle(e).color))
    expect(colors.length).toBeGreaterThan(0)
    await page.addStyleTag({ content: 'main { visibility: hidden }' })
    const background = await brightestPixel(page, await page.screenshot())
    expect(relativeLuminance(background)).toBeGreaterThan(0)
    for (const color of colors) {
      expect(contrastRatio(parseRgb(color), background)).toBeGreaterThanOrEqual(
        minimum,
      )
    }
  },
)

Then(
  'the page has a device pixel ratio of {int}',
  async ({ page }, ratio: number) => {
    expect(await page.evaluate(() => window.devicePixelRatio)).toBe(ratio)
  },
)

Then('I keep a handle to the canvas rendering context', async ({ page }) => {
  await holdRenderingContext(page, EMBER_CANVAS)
})

When('the visitor turns on reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

Then('the held rendering context is released', async ({ page }) => {
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as { heldContext: WebGLRenderingContext }
        ).heldContext.isContextLost(),
      ),
    )
    .toBe(true)
})

Then('the embers are visible on the background', async ({ page }) => {
  await page.addStyleTag({ content: 'main { visibility: hidden }' })
  const withEmbers = await page.screenshot()
  await page.addStyleTag({ content: 'canvas { visibility: hidden }' })
  const withoutEmbers = await page.screenshot()
  expect(
    await countDifferingPixels(page, withEmbers, withoutEmbers),
  ).toBeGreaterThan(0)
})
