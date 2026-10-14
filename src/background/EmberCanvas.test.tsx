import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, it, vi } from 'vitest'
import EmberCanvas from './EmberCanvas'

const embers = vi.hoisted(() => vi.fn())

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('./Embers', () => ({
  default: () => {
    embers()
    return null
  },
}))
vi.mock('./StoryObject', () => ({
  default: () => {
    throw new Error('the ember canvas must not draw the story object')
  },
}))

it('renders only the embers', () => {
  render(<EmberCanvas paused={false} />)

  expect(embers).toHaveBeenCalled()
})
