import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import {
  EMBER_CANVAS,
  STORY_CANVAS,
  holdRenderingContext,
} from '../support/canvases.ts'
import { contrastRatio, parseRgb, type Rgba } from '../support/color.ts'
import { countDifferingPixels } from '../support/screenshot.ts'

const { Given, When, Then } = createBdd()

const SCENE_CHUNK_URL = /EmberCanvas/
const STORY_CHUNK_URL = /StoryCanvas/

const showcaseIllustrations = (page: Page) =>
  page.locator('[data-showcase] [data-stage-illustration]')

const stageIllustrations = (page: Page) =>
  page.locator('[data-stage-illustration]')

Given('the 3D scene fails to load', async ({ page }) => {
  await page.route(SCENE_CHUNK_URL, (route) => route.abort())
})

Given('the story object fails to load', async ({ page }) => {
  await page.route(STORY_CHUNK_URL, (route) => route.abort())
})

Then(
  'the showcase shows the {string}, {string} and key illustrations in this order',
  async ({ page }, first: string, second: string) => {
    await expect(showcaseIllustrations(page)).toHaveCount(3)
    expect(
      await showcaseIllustrations(page).evaluateAll((svgs) =>
        svgs.map((svg) => svg.getAttribute('data-stage-illustration')),
      ),
    ).toEqual([first, second, 'key'])
    for (const svg of await showcaseIllustrations(page).all()) {
      await expect(svg).toBeVisible()
    }
  },
)

Then('the showcase shows the three stage illustrations', async ({ page }) => {
  await expect(showcaseIllustrations(page)).toHaveCount(3)
  await expect(stageIllustrations(page)).toHaveCount(3)
})

Then('the showcase is no taller than the viewport', async ({ page }) => {
  const { height } = (await page.locator('[data-showcase]').boundingBox())!
  expect(height).toBeLessThanOrEqual(page.viewportSize()!.height)
})

Then(
  'the illustrations are hidden from assistive technology',
  async ({ page }) => {
    for (const svg of await stageIllustrations(page).all()) {
      await expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
  },
)

Then('no illustration has an animation or a transition', async ({ page }) => {
  const styles = await stageIllustrations(page).evaluateAll((svgs) =>
    svgs.flatMap((svg) =>
      [svg, ...svg.querySelectorAll('path')].map((element) => {
        const { animationName, transitionDuration } = getComputedStyle(element)
        return { animationName, transitionDuration }
      }),
    ),
  )
  expect(styles.length).toBeGreaterThan(0)
  for (const style of styles) {
    expect(style.animationName).toBe('none')
    expect(parseFloat(style.transitionDuration)).toBe(0)
  }
})

Then('no stage illustration is shown', async ({ page }) => {
  await expect(stageIllustrations(page)).toHaveCount(0)
})

Then(
  'the showcase follows the opening and comes before the first family',
  async ({ page }) => {
    const order = await page.evaluate(() =>
      [...document.querySelector('main')!.children].map((element) =>
        element.matches('header')
          ? 'opening'
          : element.matches('[data-showcase]')
            ? 'showcase'
            : element.tagName.toLowerCase(),
      ),
    )
    expect(order.slice(0, 3)).toEqual(['opening', 'showcase', 'section'])
  },
)

Then('the showcase is hidden from assistive technology', async ({ page }) => {
  await expect(page.locator('[data-showcase]')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
})

Then('the showcase contains no text', async ({ page }) => {
  expect((await page.locator('[data-showcase]').textContent())?.trim()).toBe('')
})

const SECTIONS: Record<string, string> = {
  opening: 'main > header',
  'first family': 'main > section:first-of-type',
  finale: 'main > section:last-of-type',
}

const STAGE_PROGRESS: Record<string, number> = {
  '17': 0,
  '18': 1,
  key: 2,
}

const TOLERANCE = 0.05
const SCRUB_SETTLE_MS = 800
const SETTLE_MS = 300

const scrollTo = (page: Page, y: number) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)

const showcaseScroll = (page: Page, percent: number) =>
  page.evaluate(async (fraction) => {
    await document.fonts.ready
    const { top, height } = document
      .querySelector('[data-showcase]')!
      .getBoundingClientRect()
    return window.scrollY + top + fraction * (height - window.innerHeight)
  }, percent / 100)

const storyProgress = async (page: Page) =>
  Number(
    await page
      .locator('[data-story-progress]')
      .getAttribute('data-story-progress'),
  )

When(
  'I scroll {int} percent through the showcase',
  async ({ page }, percent: number) => {
    await scrollTo(page, await showcaseScroll(page, percent))
  },
)

When('I scroll past the showcase', async ({ page }) => {
  const end = await showcaseScroll(page, 100)
  await scrollTo(page, end + page.viewportSize()!.height)
})

Then('the first family is in the viewport', async ({ page }) => {
  await expect(page.locator(SECTIONS['first family'])).toBeInViewport()
})

When(
  'I scroll the {string} to the middle of the screen',
  async ({ page }, section: string) => {
    await page.evaluate(async (selector) => {
      await document.fonts.ready
      const { top, height } = document
        .querySelector(selector)!
        .getBoundingClientRect()
      window.scrollTo({
        top: window.scrollY + top + height / 2 - window.innerHeight / 2,
        behavior: 'instant',
      })
    }, SECTIONS[section])
  },
)

Then('the showcase fills the viewport', async ({ page }) => {
  await expect
    .poll(async () => {
      const box = await page.locator('[data-showcase] > div').boundingBox()
      const { height } = page.viewportSize()!
      return (
        box !== null && Math.abs(box.y) < 1 && Math.abs(box.height - height) < 1
      )
    })
    .toBe(true)
})

const expectStage = async (page: Page, stage: string) => {
  await expect
    .poll(async () =>
      Math.abs((await storyProgress(page)) - STAGE_PROGRESS[stage]),
    )
    .toBeLessThan(TOLERANCE)
}

Then('the story object shows the {word}', async ({ page }, stage: string) => {
  await expectStage(page, stage)
})

Then('the story object shows {string}', async ({ page }, stage: string) => {
  await expectStage(page, stage)
})

Then(
  'the story object is between {string} and {string}',
  async ({ page }, from: string, to: string) => {
    await expect
      .poll(async () => {
        const progress = await storyProgress(page)
        return (
          progress > STAGE_PROGRESS[from] + TOLERANCE &&
          progress < STAGE_PROGRESS[to] - TOLERANCE
        )
      })
      .toBe(true)
  },
)

Then('the story object stops changing its stage', async ({ page }) => {
  await expect
    .poll(async () => (await storyProgress(page)) > TOLERANCE)
    .toBe(true)
  // let the scrub catch up with the scroll position
  await page.waitForTimeout(SCRUB_SETTLE_MS)
  const settled = await storyProgress(page)
  await page.waitForTimeout(SCRUB_SETTLE_MS)
  expect(await storyProgress(page)).toBe(settled)
})

const WINDOWS: Record<string, { width: number; height: number }> = {
  phone: { width: 390, height: 844 },
  laptop: { width: 1536, height: 864 },
  tall: { width: 1920, height: 1080 },
}

Given('a {word} window', async ({ page }, device: string) => {
  await page.setViewportSize(WINDOWS[device])
})

const CENTER_FRACTION = 0.4
const canvasStyle = (page: Page, css: string) =>
  page.evaluate((content) => {
    let style = document.getElementById('bdd-canvas-style')
    if (!style) {
      style = document.createElement('style')
      style.id = 'bdd-canvas-style'
      document.head.append(style)
    }
    style.textContent = content
  }, css)

// the story canvas sits inside main, so it needs an explicit override
const showOnly = (page: Page, selector: string) =>
  canvasStyle(
    page,
    `main { visibility: hidden } canvas { visibility: hidden } ${selector} { visibility: visible }`,
  )

Then(
  'the story object is not drawn over the {string}',
  async ({ page }, name: string) => {
    const section = page.locator(SECTIONS[name])
    await expect
      .poll(async () => {
        const canvas = (await page.locator(STORY_CANVAS).boundingBox())!
        const box = (await section.boundingBox())!
        const overlaps =
          canvas.x < box.x + box.width &&
          box.x < canvas.x + canvas.width &&
          canvas.y < box.y + box.height &&
          box.y < canvas.y + canvas.height
        return overlaps
      })
      .toBe(false)
  },
)

const hideAllCanvases = (page: Page) =>
  canvasStyle(page, 'main { visibility: hidden } canvas { visibility: hidden }')

const centerClip = (page: Page) => {
  const { width, height } = page.viewportSize()!
  return {
    width: width * CENTER_FRACTION,
    height: height * CENTER_FRACTION,
    x: (width * (1 - CENTER_FRACTION)) / 2,
    y: (height * (1 - CENTER_FRACTION)) / 2,
  }
}

const canvasScreenshot = async (
  page: Page,
  clip: ReturnType<typeof centerClip>,
  selector: string,
) => {
  await showOnly(page, selector)
  const withCanvas = await page.screenshot({ clip })
  await hideAllCanvases(page)
  const withoutCanvas = await page.screenshot({ clip })
  return { withCanvas, withoutCanvas }
}

Then('the story object is visible on the background', async ({ page }) => {
  await page.waitForTimeout(SETTLE_MS)
  const clip = centerClip(page)
  const litPixels = async (selector: string) => {
    const { withCanvas, withoutCanvas } = await canvasScreenshot(
      page,
      clip,
      selector,
    )
    return countDifferingPixels(page, withCanvas, withoutCanvas)
  }
  const withStory = await litPixels(`${EMBER_CANVAS}, ${STORY_CANVAS}`)
  const embersOnly = await litPixels(EMBER_CANVAS)
  expect(withStory).toBeGreaterThan(embersOnly * 2)
})

const remembered = new WeakMap<Page, Buffer>()

When('I remember how the center of the screen looks', async ({ page }) => {
  await page.waitForTimeout(SETTLE_MS)
  await showOnly(page, 'canvas')
  remembered.set(page, await page.screenshot({ clip: centerClip(page) }))
})

// at 1280x720 two different stages differ by about 65,000 pixels and the same stage by about 500
const MORPH_MIN_DIFFERING_PIXELS = 40000

Then(
  'the center of the screen looks different from what I remembered',
  async ({ page }) => {
    await page.waitForTimeout(SETTLE_MS)
    const now = await page.screenshot({ clip: centerClip(page) })
    expect(
      await countDifferingPixels(page, remembered.get(page)!, now),
    ).toBeGreaterThan(MORPH_MIN_DIFFERING_PIXELS)
  },
)

Then(
  'the brightest pixel of the story object has a contrast ratio of at least {int} against the page background color',
  async ({ page }, minimum: number) => {
    await page.waitForTimeout(SETTLE_MS)
    await showOnly(page, STORY_CANVAS)
    const brightest = await page.evaluate(
      async (base64): Promise<Rgba> => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
        let best = { r: 0, g: 0, b: 0, a: 1 }
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] + data[i + 1] + data[i + 2] > best.r + best.g + best.b) {
            best = { r: data[i], g: data[i + 1], b: data[i + 2], a: 1 }
          }
        }
        return best
      },
      (await page.screenshot()).toString('base64'),
    )
    const pageColor = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    )
    expect(
      contrastRatio(brightest, parseRgb(pageColor)),
    ).toBeGreaterThanOrEqual(minimum)
  },
)

Then(
  'I keep a handle to the story canvas rendering context',
  async ({ page }) => {
    await holdRenderingContext(page, STORY_CANVAS)
  },
)

Then('the story canvas is removed', async ({ page }) => {
  await expect(page.locator(STORY_CANVAS)).toHaveCount(0)
})
