import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import Ornaments from './Ornaments'
import { ornamentLayout, PLACEMENTS } from './ornamentLayout'

it.each(PLACEMENTS)(
  'is hidden from assistive technology in the %s',
  (placement) => {
    const { container } = render(<Ornaments placement={placement} />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  },
)

it.each(PLACEMENTS)('draws no image in the %s', (placement) => {
  const { container } = render(<Ornaments placement={placement} />)

  expect(container.querySelector('img')).toBeNull()
  expect(container.querySelector('[role="img"]')).toBeNull()
})

it.each(PLACEMENTS)('renders every piece of the %s', (placement) => {
  const { container } = render(<Ornaments placement={placement} />)

  const pieceCount = ornamentLayout[placement].reduce(
    (count, { pieces }) => count + pieces.length,
    0,
  )
  expect(container.querySelectorAll('svg[data-ornament]')).toHaveLength(
    pieceCount,
  )
})

it.each(PLACEMENTS)(
  'gives every composition of the %s stems, blossoms and dust',
  (placement) => {
    const { container } = render(<Ornaments placement={placement} />)

    const compositions = [...container.firstElementChild!.children]
    expect(compositions).toHaveLength(2)
    for (const composition of compositions) {
      const layers = [...composition.querySelectorAll('[data-ornament]')].map(
        (piece) => piece.getAttribute('data-ornament-layer'),
      )
      expect(new Set(layers)).toEqual(new Set(['stem', 'blossom', 'dust']))
    }
  },
)

it('shows another composition in the showcase than in the opening', () => {
  const opening = render(<Ornaments placement="opening" />)
  const showcase = render(<Ornaments placement="showcase" />)

  const drawing = (root: HTMLElement) =>
    [...root.querySelectorAll('svg[data-ornament]')].map((piece) =>
      piece.parentElement!.getAttribute('style'),
    )
  expect(drawing(showcase.container)).not.toEqual(drawing(opening.container))
})

it('gives every gradient of every rendered piece its own id', () => {
  const { container } = render(
    <>
      <Ornaments placement="opening" />
      <Ornaments placement="showcase" />
    </>,
  )

  const ids = [...container.querySelectorAll('[id]')].map(({ id }) => id)
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size).toBe(ids.length)
})
