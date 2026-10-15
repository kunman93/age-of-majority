import { render, screen, within } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'

const mode = vi.hoisted(() => ({ current: 'static' as 'scene' | 'static' }))

vi.mock('./background/useSceneMode', () => ({
  useSceneMode: () => ({ mode: mode.current, fallBackToStatic: () => {} }),
}))

vi.mock('./background/Background', () => ({ default: () => null }))

beforeEach(() => {
  mode.current = 'static'
})

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
    { selector: '.sr-only' },
  )
  expect(
    heading.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
})

it('renders the family headings in order after the intro', () => {
  render(<App />)

  const intro = screen.getByText(/^Today you come of age/, {
    selector: '.sr-only',
  })
  const headings = screen.getAllByRole('heading', {
    level: 3,
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

it('renders the birthday wishes heading with its overline directly above', () => {
  render(<App />)

  const intro = screen.getByText(/^Today you come of age/, {
    selector: '.sr-only',
  })
  const heading = screen.getByRole('heading', {
    level: 2,
    name: 'Birthday wishes',
  })
  const overline = screen.getByText('From your family')
  expect(overline.nextElementSibling).toBe(heading)
  expect(
    intro.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
})

it('groups every family under the birthday wishes heading', () => {
  render(<App />)

  const wishes = screen.getByRole('region', { name: 'Birthday wishes' })
  const families = screen.getAllByRole('heading', {
    level: 3,
    name: /^Family /,
  })
  expect(families).toHaveLength(3)
  families.forEach((family) => expect(wishes).toContainElement(family))
  expect(within(wishes).getByRole('heading', { level: 2 })).toHaveTextContent(
    'Birthday wishes',
  )
})

it('renders the finale after the last family', () => {
  const { container } = render(<App />)

  const lastFamily = screen.getByRole('heading', { name: 'Family Dolor' })
  const finale = screen.getByRole('region', { name: "Here's to you, Sara!" })
  const heading = within(finale).getByRole('heading')
  const message = within(finale).getByText(
    'Eighteen years of you, and the best is still ahead. Whatever you choose next, your family is cheering you on. Happy birthday!',
  )
  const signature = within(finale).getByText('With love, your family')
  const follows = (a: Node, b: Node) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
  expect(follows(lastFamily, finale)).toBeTruthy()
  expect(follows(heading, message)).toBeTruthy()
  expect(follows(message, signature)).toBeTruthy()
  const cake = within(finale).getByRole('button', {
    name: 'Tap the cake to blow out the candles',
  })
  expect(follows(signature, cake)).toBeTruthy()
  expect(finale.lastElementChild!.lastElementChild).toBe(cake)
  expect(finale.nextElementSibling).toBeNull()
  expect(container.lastElementChild).toBe(finale.parentElement)
})

const showcase = () => document.querySelector('[data-showcase]')

it('renders the showcase between the opening and the birthday wishes', () => {
  render(<App />)

  const opening = screen.getByRole('banner')
  const wishes = screen.getByRole('region', { name: 'Birthday wishes' })
  expect(opening.nextElementSibling).toBe(showcase())
  expect(showcase()!.nextElementSibling).toBe(wishes)
})

it('hides the showcase from assistive technology and gives it no text', () => {
  render(<App />)

  expect(showcase()).toHaveAttribute('aria-hidden', 'true')
  expect(showcase()!.textContent).toBe('')
})

it('keeps the opening a plain header', () => {
  render(<App />)

  expect(screen.getByRole('banner').tagName).toBe('HEADER')
})

it('shows the three stage illustrations in order in static mode', () => {
  mode.current = 'static'
  render(<App />)

  const stages = [...showcase()!.querySelectorAll('[data-stage-illustration]')]
  expect(
    stages.map((el) => el.getAttribute('data-stage-illustration')),
  ).toEqual(['17', '18', 'key'])
  expect(document.querySelectorAll('[data-stage-illustration]')).toHaveLength(3)
})

it('shows no illustrations in scene mode', () => {
  mode.current = 'scene'
  render(<App />)

  expect(document.querySelectorAll('[data-stage-illustration]')).toHaveLength(0)
})

it('left-aligns the heading and the intro', () => {
  render(<App />)

  const intro = document.querySelector('[data-intro]')!
  expect(intro).toHaveClass('text-left')
  expect(intro).not.toHaveClass('text-center')
  const greeting = screen.getByRole('heading', { level: 1 })
  expect(greeting).toHaveClass('text-left')
  expect(greeting).not.toHaveClass('text-center')
})

it('puts the heading and overline above one board holding every family', () => {
  render(<App />)

  const wishes = screen.getByRole('region', { name: 'Birthday wishes' })
  const board = wishes.querySelector('[data-board]')!
  expect(wishes.querySelectorAll('[data-board]')).toHaveLength(1)
  expect(board).toHaveClass('overflow-x-clip')
  expect(board).not.toContainElement(
    screen.getByRole('heading', { level: 2, name: 'Birthday wishes' }),
  )
  expect(board).not.toContainElement(screen.getByText('From your family'))
  screen
    .getAllByRole('heading', { level: 3, name: /^Family / })
    .forEach((heading) => expect(board).toContainElement(heading))
  screen
    .getAllByRole('figure')
    .forEach((card) => expect(board).toContainElement(card))
  expect(board.querySelector('img, svg, picture')).toBeNull()
})
