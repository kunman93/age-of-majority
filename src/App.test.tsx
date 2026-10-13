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
