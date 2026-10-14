import { expect, type Locator, type Page } from '@playwright/test'

const LOOP_TIMEOUT_MS = 30000

export const intro = (page: Page): Locator => page.locator('[data-intro]')

export type IntroState = {
  phase: string
  sentence: number
  typed: number
  total: number
  typedText: string
}

export const introState = (page: Page): Promise<IntroState> =>
  intro(page).evaluate((paragraph) => {
    const lines = [
      ...paragraph.querySelectorAll<HTMLElement>('[data-sentence-line]'),
    ]
    const sentence = Number(paragraph.getAttribute('data-sentence'))
    const line = lines[sentence]
    const typedText =
      line?.querySelector('[data-typed-text]')?.textContent ?? ''
    const untypedText =
      line?.querySelector('[data-untyped-text]')?.textContent ?? ''
    return {
      phase: paragraph.getAttribute('data-typed') ?? '',
      sentence,
      typed: typedText.length,
      total: typedText.length + untypedText.length,
      typedText,
    }
  })

export const waitUntilIntro = (
  page: Page,
  expected: Partial<IntroState>,
  timeout = LOOP_TIMEOUT_MS,
) =>
  expect
    .poll(() => introState(page), { timeout, intervals: [100] })
    .toMatchObject(expected)

export const waitUntilPartlyTyped = (page: Page, sentence: number) =>
  expect
    .poll(
      async () => {
        const state = await introState(page)
        return (
          state.sentence === sentence &&
          state.phase === 'typing' &&
          state.typed > 0 &&
          state.typed < state.total
        )
      },
      { timeout: LOOP_TIMEOUT_MS },
    )
    .toBe(true)

export const sentenceLine = (page: Page, index: number): Locator =>
  page.locator('[data-intro] [data-sentence-line]').nth(index)
