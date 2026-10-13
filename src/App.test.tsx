import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders the birthday heading', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Happy 18th Birthday, Sara!' }),
  ).toBeInTheDocument()
  expect(screen.queryByText('Happy Age of Majority!')).toBeNull()
})

it('renders the intro below the heading', () => {
  render(<App />)

  const heading = screen.getByRole('heading', {
    name: 'Happy 18th Birthday, Sara!',
  })
  const intro = screen.getByText(
    'Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say.',
  )
  expect(
    heading.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
})
