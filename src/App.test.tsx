import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders the birthday heading', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Happy Age of Majority!' }),
  ).toBeInTheDocument()
  expect(screen.queryByText('Happy 18th Birthday!')).toBeNull()
})
