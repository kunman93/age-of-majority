import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { CANDLE_COUNT } from './candleLayout'
import CakeIllustration from './CakeIllustration'

const illustration = (container: HTMLElement) =>
  container.querySelector('[data-cake-illustration]')!

it('is a decorative svg hidden from assistive technology', () => {
  const { container } = render(<CakeIllustration blown={false} />)

  expect(illustration(container).tagName.toLowerCase()).toBe('svg')
  expect(illustration(container)).toHaveAttribute('aria-hidden', 'true')
})

it('draws 18 candles, each with a flame while lit', () => {
  const { container } = render(<CakeIllustration blown={false} />)

  expect(container.querySelectorAll('[data-candle]')).toHaveLength(CANDLE_COUNT)
  expect(container.querySelectorAll('[data-flame]')).toHaveLength(CANDLE_COUNT)
})

it('draws no flames once blown out', () => {
  const { container } = render(<CakeIllustration blown />)

  expect(container.querySelectorAll('[data-candle]')).toHaveLength(CANDLE_COUNT)
  expect(container.querySelectorAll('[data-flame]')).toHaveLength(0)
})

it('has no animation or transition and ignores pointer events', () => {
  const { container } = render(<CakeIllustration blown={false} />)

  expect(illustration(container).outerHTML).not.toMatch(
    /animate|transition|animation/i,
  )
  expect(illustration(container)).toHaveClass('pointer-events-none')
})
