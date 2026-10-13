import { render, screen, within } from '@testing-library/react'
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

it('renders the family headings in order after the intro', () => {
  render(<App />)

  const intro = screen.getByText(/^Today you come of age/)
  const headings = screen.getAllByRole('heading', {
    level: 2,
    name: /^Family /,
  })
  expect(headings.map((heading) => heading.textContent)).toEqual([
    'Family Lorem',
    'Family Ipsum',
    'Family Dolor',
  ])
  headings.forEach((heading) =>
    expect(
      intro.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy(),
  )
})

it('renders the finale after the last family', () => {
  render(<App />)

  const lastFamily = screen.getByRole('heading', { name: 'Family Dolor' })
  const finale = screen.getByRole('region', { name: "Here's to you, Sara!" })
  const message = within(finale).getByText(
    'Eighteen years of you, and the best is still ahead. Whatever you choose next, your family is cheering you on. Happy birthday!',
  )
  const signature = within(finale).getByText('With love, your family')
  const follows = (a: Node, b: Node) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
  expect(follows(lastFamily, finale)).toBeTruthy()
  expect(follows(message, signature)).toBeTruthy()
  expect(finale.nextElementSibling).toBeNull()
})
