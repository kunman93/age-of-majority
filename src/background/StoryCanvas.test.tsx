import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, it, vi } from 'vitest'
import StoryCanvas from './StoryCanvas'

const refs = vi.hoisted(() => ({
  progress: { current: 0 },
  entry: { current: 0 },
  exit: { current: 0 },
}))
const canvasProps = vi.hoisted(() => vi.fn())
const storyObject = vi.hoisted(() => vi.fn())

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: { children: ReactNode }) => {
    canvasProps(props)
    return <>{children}</>
  },
}))
vi.mock('./StoryObject', () => ({
  default: (props: unknown) => {
    storyObject(props)
    return null
  },
}))
vi.mock('./useStoryScroll', () => ({ useStoryScroll: () => refs }))

it('is a decorative wrapper that fills its parent and reports the progress', () => {
  const { container } = render(<StoryCanvas />)

  const wrapper = container.firstElementChild!
  expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  expect(wrapper).toHaveAttribute('data-story-progress', '0.00')
  expect(wrapper).toHaveAttribute('data-story-entry', '0.00')
  expect(wrapper).toHaveAttribute('data-story-exit', '0.00')
  expect(wrapper.className).toContain('absolute')
  expect(wrapper.className).toContain('inset-0')
  expect(wrapper.className).toContain('pointer-events-none')
})

it('renders on demand, at most 2 pixels per CSS pixel, without pointer input', () => {
  render(<StoryCanvas />)

  const props = canvasProps.mock.calls[0][0]
  expect(props.frameloop).toBe('demand')
  expect(props.dpr).toEqual([1, 2])
  expect(props.style).toEqual({ pointerEvents: 'none' })
})

it('hands the scroll progress, entry and exit refs to the story object', () => {
  render(<StoryCanvas />)

  expect(storyObject.mock.calls[0][0]).toEqual(refs)
})
