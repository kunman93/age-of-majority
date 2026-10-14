import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import FamilySection from './FamilySection'
import type { Family } from './families'

const family: Family = {
  name: 'Family Test',
  messages: [
    { author: 'Family Test', text: 'First text' },
    { author: 'Member Test', text: 'Second text' },
  ],
}

it('renders a region named by the family with its heading', () => {
  render(<FamilySection family={family} firstCardIndex={0} />)

  const region = screen.getByRole('region', { name: 'Family Test' })
  expect(
    within(region).getByRole('heading', { level: 2, name: 'Family Test' }),
  ).toBeInTheDocument()
})

it('renders each message text followed by its author', () => {
  render(<FamilySection family={family} firstCardIndex={0} />)

  const messages = screen.getAllByRole('figure')
  expect(messages).toHaveLength(2)
  ;[
    ['First text', 'Family Test'],
    ['Second text', 'Member Test'],
  ].forEach(([text, author], index) => {
    const message = within(messages[index])
    const textNode = message.getByText(text)
    const authorNode = message.getByText(author)
    expect(
      textNode.compareDocumentPosition(authorNode) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})

it('keeps families with the same name as separate regions', () => {
  const other: Family = {
    name: 'Family Test',
    messages: [{ author: 'Other Member', text: 'Other text' }],
  }
  render(
    <>
      <FamilySection family={family} firstCardIndex={0} />
      <FamilySection family={other} firstCardIndex={1} />
    </>,
  )

  const regions = screen.getAllByRole('region', { name: 'Family Test' })
  expect(regions).toHaveLength(2)
  expect(within(regions[0]).getByText('First text')).toBeInTheDocument()
  expect(within(regions[0]).queryByText('Other text')).toBeNull()
  expect(within(regions[1]).getByText('Other text')).toBeInTheDocument()

  const headings = regions.map((region) =>
    within(region).getByRole('heading', { level: 2 }),
  )
  regions.forEach((region, index) =>
    expect(region.getAttribute('aria-labelledby')).toBe(headings[index].id),
  )
  expect(headings[0].id).not.toBe(headings[1].id)
})

it('tilts consecutive cards in opposite directions, continuing from the previous family', () => {
  render(<FamilySection family={family} firstCardIndex={1} />)

  const [first, second] = screen.getAllByRole('figure')
  expect(first).toHaveClass('rotate-[1.2deg]')
  expect(second).toHaveClass('rotate-[-1.2deg]')
})

it('keeps the cards text only', () => {
  render(<FamilySection family={family} firstCardIndex={0} />)

  screen
    .getAllByRole('figure')
    .forEach((card) =>
      expect(card.querySelector('img, svg, picture')).toBeNull(),
    )
})
