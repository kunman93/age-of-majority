/// <reference lib="dom" />
import type { Locator } from '@playwright/test'

export const opacityOf = (locator: Locator) =>
  locator.evaluate((element) => {
    let opacity = 1
    for (let node: Element | null = element; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity)
    }
    return opacity
  })

// Scrolls so the element's top sits at `fraction` of the viewport height, plus `pixels`
export const scrollTopTo = (locator: Locator, fraction: number, pixels = 0) =>
  locator.evaluate(
    (element, [fractionOfViewport, extra]) => {
      const target = window.innerHeight * fractionOfViewport + extra
      window.scrollTo(
        0,
        window.scrollY + element.getBoundingClientRect().top - target,
      )
    },
    [fraction, pixels],
  )
