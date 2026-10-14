import { expect, type Locator, type Page } from '@playwright/test'

const TYPING_TIMEOUT_MS = 15000

export const intro = (page: Page): Locator => page.locator('[data-intro]')

export const waitUntilIntroIsTyped = (page: Page) =>
  expect(intro(page)).toHaveAttribute('data-typed', 'done', {
    timeout: TYPING_TIMEOUT_MS,
  })
