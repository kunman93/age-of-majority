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

it.each(PLACEMENTS)('renders every ornament of the %s', (placement) => {
  const { container } = render(<Ornaments placement={placement} />)

  expect(container.querySelectorAll('svg[data-ornament]')).toHaveLength(
    ornamentLayout[placement].length,
  )
})
