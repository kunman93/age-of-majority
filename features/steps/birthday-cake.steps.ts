import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { CAKE_CANVAS, holdRenderingContext } from '../support/canvases.ts'
import { scrollTopTo } from '../support/scroll.ts'

const { Given, When, Then } = createBdd()

const CANDLE_COUNT = 18
const SCROLL_UP_A_LITTLE = 100

const cake = (page: Page) => page.locator('[data-cake-state]')
const candles = (page: Page) => cake(page).locator('[data-candle]')
const flames = (page: Page) => cake(page).locator('[data-flame]')

When('I click the cake', async ({ page }) => {
  await cake(page).click()
})

// a blown-out cake is aria-disabled, which Playwright does not treat as clickable
When('I click the cake again', async ({ page }) => {
  await cake(page).click({ force: true })
})

// scroll triggers only notice a scroll position once a frame has passed
const afterNextFrame = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )

When('I move the focus to the cake with Tab', async ({ page }) => {
  // the cake is the last focusable element of the card
  await page.keyboard.press('Shift+Tab')
  await expect(cake(page)).toBeFocused()
})

When('I press {string}', async ({ page }, key: string) => {
  await page.keyboard.press(key)
})

When('I scroll up until the cake is below the viewport', async ({ page }) => {
  await scrollTopTo(cake(page), 1, 50)
  await afterNextFrame(page)
})

When('I scroll up a little', async ({ page }) => {
  await page.evaluate(
    (pixels) => window.scrollBy(0, -pixels),
    SCROLL_UP_A_LITTLE,
  )
})

Then(
  "I see a cake with 18 lit candles below the finale's signature",
  async ({ page }) => {
    await expect(candles(page)).toHaveCount(CANDLE_COUNT)
    await expect(flames(page)).toHaveCount(CANDLE_COUNT)
    const signature = await page
      .getByText('With love, your family')
      .boundingBox()
    const box = await cake(page).boundingBox()
    expect(box!.y).toBeGreaterThan(signature!.y + signature!.height - 1)
  },
)

Then('nothing follows the cake', async ({ page }) => {
  const followed = await cake(page).evaluate((button) => {
    const section = button.closest('section')!
    const main = section.closest('main')!
    return (
      button.nextElementSibling !== null ||
      button.parentElement !== section ||
      section.nextElementSibling !== null ||
      main.lastElementChild !== section
    )
  })
  expect(followed).toBe(false)
})

Then(
  'a button named {string} contains the cake',
  async ({ page }, name: string) => {
    await expect(
      page.getByRole('button', { name }).locator('[data-cake-illustration]'),
    ).toHaveCount(1)
  },
)

Then('the button {string} is announced', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name })).toBeVisible()
})

Then(
  "the cake's picture is hidden from assistive technology",
  async ({ page }) => {
    await expect(
      cake(page).locator('[data-cake-illustration]'),
    ).toHaveAttribute('aria-hidden', 'true')
  },
)

Then('all 18 candles are out', async ({ page }) => {
  await expect(cake(page)).toHaveAttribute('data-cake-state', 'blown')
  await expect(candles(page)).toHaveCount(CANDLE_COUNT)
  await expect(flames(page)).toHaveCount(0)
})

Then('all 18 candles are lit', async ({ page }) => {
  await expect(cake(page)).toHaveAttribute('data-cake-state', 'lit')
  await expect(flames(page)).toHaveCount(CANDLE_COUNT)
})

Then('the hint reads {string}', async ({ page }, hint: string) => {
  await expect(cake(page)).toHaveText(hint)
})

Then('the cake button shows a focus indicator', async ({ page }) => {
  const outline = await cake(page).evaluate((button) => {
    const { outlineStyle, outlineWidth } = getComputedStyle(button)
    return { outlineStyle, width: parseFloat(outlineWidth) }
  })
  expect(outline.outlineStyle).not.toBe('none')
  expect(outline.width).toBeGreaterThan(0)
})

Then('the cake button still has the focus', async ({ page }) => {
  await expect(cake(page)).toBeFocused()
})

Then('the cake button is reported as disabled', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Make a wish!' }),
  ).toBeDisabled()
})

Then('no cake element has an animation or a transition', async ({ page }) => {
  const styles = await cake(page).evaluate((button) =>
    [button, ...button.querySelectorAll('*')].map((element) => {
      const { animationName, transitionDuration } = getComputedStyle(element)
      return { animationName, transitionDuration }
    }),
  )
  for (const style of styles) {
    expect(style.animationName).toBe('none')
    expect(parseFloat(style.transitionDuration)).toBe(0)
  }
})

Given('the 3D cake fails to load', async ({ page }) => {
  await page.route(/CakeCanvas/, (route) => route.abort())
})

const cakeCanvas = (page: Page) => page.locator(CAKE_CANVAS)

Then(
  'the cake is drawn in a canvas inside the cake button',
  async ({ page }) => {
    await expect(cakeCanvas(page)).toHaveCount(1)
    const inside = await cakeCanvas(page).evaluate((canvas) => {
      const button = canvas
        .closest('[data-cake-state]')!
        .getBoundingClientRect()
      const box = canvas.getBoundingClientRect()
      return (
        box.width > 0 &&
        box.left >= button.left - 1 &&
        box.right <= button.right + 1 &&
        box.top >= button.top - 1 &&
        box.bottom <= button.bottom + 1
      )
    })
    expect(inside).toBe(true)
  },
)

Then(
  'the cake canvas is hidden from assistive technology',
  async ({ page }) => {
    const hidden = await cakeCanvas(page).evaluate(
      (canvas) => canvas.closest('[aria-hidden="true"]') !== null,
    )
    expect(hidden).toBe(true)
  },
)

Then('the cake canvas does not catch pointer input', async ({ page }) => {
  const pointerEvents = await cakeCanvas(page).evaluate(
    (canvas) => getComputedStyle(canvas).pointerEvents,
  )
  expect(pointerEvents).toBe('none')
})

Then('no cake illustration is shown', async ({ page }) => {
  await expect(page.locator('[data-cake-illustration]')).toHaveCount(0)
})

Then('no cake canvas is shown', async ({ page }) => {
  await page.waitForLoadState('networkidle')
  await expect(cakeCanvas(page)).toHaveCount(0)
})

Then('the cake is blown out', async ({ page }) => {
  await expect(cake(page)).toHaveAttribute('data-cake-state', 'blown')
})

Then('the cake is lit', async ({ page }) => {
  await expect(cake(page)).toHaveAttribute('data-cake-state', 'lit')
})

Then(
  'the cake canvas has at most {int} device pixels per CSS pixel',
  async ({ page }, maximum: number) => {
    await expect
      .poll(() =>
        cakeCanvas(page).evaluate(
          (canvas) => (canvas as HTMLCanvasElement).width,
        ),
      )
      .not.toBe(300)
    const ratio = await cakeCanvas(page).evaluate((canvas) => ({
      horizontal: (canvas as HTMLCanvasElement).width / canvas.clientWidth,
      vertical: (canvas as HTMLCanvasElement).height / canvas.clientHeight,
    }))
    expect(ratio.horizontal).toBeLessThanOrEqual(maximum)
    expect(ratio.vertical).toBeLessThanOrEqual(maximum)
  },
)

Then(
  'I keep a handle to the cake canvas rendering context',
  async ({ page }) => {
    await holdRenderingContext(page, CAKE_CANVAS)
  },
)
