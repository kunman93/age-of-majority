import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./background/useSceneMode', () => ({
  useSceneMode: () => ({ mode: 'static', fallBackToStatic: () => {} }),
}))

vi.mock('./background/Background', () => ({ default: () => null }))

vi.mock('./families', () => ({
  families: [
    { name: 'Family Twin', messages: [{ author: 'A', text: 'First' }] },
    {
      name: 'Family Twin',
      messages: [
        { author: 'B', text: 'Second' },
        { author: 'C', text: 'Third' },
      ],
    },
  ],
}))

const revealing = (kind: string) => [
  ...document.querySelectorAll(`[data-reveal="${kind}"]`),
]

it('marks every heading below the opening for the heading reveal', () => {
  render(<App />)

  const wishes = screen.getByRole('heading', { name: 'Birthday wishes' })
  const families = screen.getAllByRole('heading', { name: 'Family Twin' })
  const finale = screen.getByRole('heading', { name: "Here's to you, Sara!" })
  const overline = screen.getByText('From your family')
  expect(revealing('heading')).toHaveLength(families.length + 2)
  for (const target of [wishes, overline, ...families, finale]) {
    expect(target.closest('[data-reveal="heading"]')).not.toBeNull()
  }
  expect(overline.closest('[data-reveal]')).toBe(
    wishes.closest('[data-reveal]'),
  )
})

it('marks each message card for the card reveal', () => {
  render(<App />)

  const messages = screen.getAllByRole('figure')
  expect(revealing('card')).toHaveLength(messages.length)
  for (const message of messages) {
    expect(message.parentElement).toHaveAttribute('data-reveal', 'card')
  }
})

it('marks the finale message, signature and cake for the fade after its heading', () => {
  render(<App />)

  const finale = screen.getByRole('region', { name: "Here's to you, Sara!" })
  const fade = finale.querySelector('[data-reveal="fade"]')!
  expect(revealing('fade')).toEqual([fade])
  expect(fade).toHaveTextContent(/Eighteen years of you/)
  expect(fade).toHaveTextContent(/With love, your family/)
  expect(fade).toContainElement(screen.getByRole('button'))
  expect(fade).not.toContainElement(
    screen.getByRole('heading', { name: "Here's to you, Sara!" }),
  )
  expect(finale).toHaveAttribute('data-finale')
  expect(finale).not.toHaveAttribute('data-reveal')
})

it('marks the opening and the intro', () => {
  render(<App />)

  expect(screen.getByRole('banner')).toHaveAttribute('data-opening')
  expect(document.querySelector('[data-intro]')).toHaveTextContent(
    /Today you come of age/,
  )
})
