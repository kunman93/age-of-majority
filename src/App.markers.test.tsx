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

const reveals = () => [...document.querySelectorAll('[data-reveal]')]

it('marks each family heading, each message card and the finale for reveal', () => {
  render(<App />)

  const headings = screen.getAllByRole('heading', { name: 'Family Twin' })
  const messages = screen.getAllByRole('figure')
  const finale = screen.getByRole('region', { name: "Here's to you, Sara!" })
  expect(headings).toHaveLength(2)
  expect(messages).toHaveLength(3)
  expect(reveals()).toHaveLength(headings.length + messages.length + 1)
  for (const target of [...headings, ...messages, finale]) {
    expect(target.closest('[data-reveal]')).not.toBeNull()
  }
})

it('marks the opening and the intro', () => {
  render(<App />)

  expect(screen.getByRole('banner')).toHaveAttribute('data-opening')
  expect(document.querySelector('[data-intro]')).toHaveTextContent(
    /Today you come of age/,
  )
})
