import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import Showcase from './Showcase'

const storyCanvas = vi.hoisted(() => ({ fail: false }))

vi.mock('../background/StoryCanvas', () => ({
  default: () => {
    if (storyCanvas.fail) throw new Error('load failed')
    return <div data-testid="story-canvas" />
  },
}))

afterEach(() => {
  storyCanvas.fail = false
  vi.restoreAllMocks()
})

it('is a tall container with a sticky viewport part in scene mode', () => {
  const { container } = render(
    <Showcase mode="scene" onSceneError={() => {}} />,
  )

  const outer = container.firstElementChild!
  expect(outer).toHaveAttribute('data-showcase')
  expect(outer).toHaveAttribute('aria-hidden', 'true')
  expect(outer.className).toContain('h-[300svh]')
  const inner = outer.firstElementChild!
  expect(inner.className).toContain('sticky')
  expect(inner.className).toContain('top-0')
  expect(inner.className).toContain('h-svh')
})

it('renders the story canvas inside the sticky part in scene mode', async () => {
  const { container } = render(
    <Showcase mode="scene" onSceneError={() => {}} />,
  )

  const canvas = await screen.findByTestId('story-canvas')
  expect(canvas.parentElement).toBe(
    container.firstElementChild!.firstElementChild,
  )
})

it('renders no story canvas in static mode', () => {
  render(<Showcase mode="static" onSceneError={() => {}} />)

  expect(screen.queryByTestId('story-canvas')).toBeNull()
})

it('reports a failing story canvas and keeps the sticky part', async () => {
  storyCanvas.fail = true
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const onSceneError = vi.fn()

  const { container } = render(
    <Showcase mode="scene" onSceneError={onSceneError} />,
  )

  await act(() => Promise.resolve())
  expect(onSceneError).toHaveBeenCalled()
  expect(screen.queryByTestId('story-canvas')).toBeNull()
  expect(container.firstElementChild!.firstElementChild).toBeEmptyDOMElement()
})

it('has no sticky part and a normal height in static mode', () => {
  const { container } = render(
    <Showcase mode="static" onSceneError={() => {}} />,
  )

  const outer = container.firstElementChild!
  expect(outer).toHaveAttribute('data-showcase')
  expect(outer.className).not.toContain('svh')
  expect(container.innerHTML).not.toContain('sticky')
})

it('lays the three illustrations out in one row', () => {
  const { container } = render(
    <Showcase mode="static" onSceneError={() => {}} />,
  )

  const outer = container.firstElementChild!
  expect(outer.className).toContain('grid-cols-3')
  expect(outer.className).not.toContain('grid-cols-2')
  expect(outer.querySelectorAll('[data-stage-illustration]')).toHaveLength(3)
})
