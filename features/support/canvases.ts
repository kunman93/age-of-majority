import { expect, type Page } from '@playwright/test'

// the story canvas lives in the showcase, the cake canvas in the cake button and the ember canvas in the fixed background
export const STORY_CANVAS = '[data-story-progress] canvas'
export const CAKE_CANVAS = '[data-cake-state] canvas'
export const EMBER_CANVAS =
  'canvas:not([data-story-progress] canvas):not([data-cake-state] canvas)'

export const holdRenderingContext = async (page: Page, selector: string) => {
  // The renderer is set up once the canvas leaves its 300px default width
  await expect
    .poll(() =>
      page.locator(selector).evaluate((c) => (c as HTMLCanvasElement).width),
    )
    .not.toBe(300)
  await page.locator(selector).evaluate((canvas) => {
    const context =
      (canvas as HTMLCanvasElement).getContext('webgl2') ??
      (canvas as HTMLCanvasElement).getContext('webgl')
    ;(window as unknown as { heldContext: unknown }).heldContext = context
  })
}
