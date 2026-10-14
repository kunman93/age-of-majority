import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ScrollTrigger } from '../gsap'
import { useStoryScroll } from './useStoryScroll'

const invalidate = vi.hoisted(() => vi.fn())
vi.mock('@react-three/fiber', () => ({ invalidate }))

// ScrollTrigger reads matchMedia while it is registered on import
vi.hoisted(() => {
  window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as never
})

let showcase: HTMLElement

beforeEach(() => {
  showcase = document.createElement('div')
  showcase.dataset.showcase = ''
  document.body.append(showcase)
})

afterEach(() => {
  document.body.replaceChildren()
})

const renderDriver = () => {
  const wrapper = { current: document.createElement('div') }
  return { wrapper, ...renderHook(() => useStoryScroll(wrapper)) }
}

const trigger = () => ScrollTrigger.getAll()[0]

it('starts at the first stage', () => {
  const { result } = renderDriver()

  expect(result.current.current).toBe(0)
})

it('creates one scroll trigger over the showcase', () => {
  renderDriver()

  expect(ScrollTrigger.getAll()).toHaveLength(1)
  expect(trigger().trigger).toBe(showcase)
  expect(trigger().vars.start).toBe('top top')
  expect(trigger().vars.end).toBe('bottom bottom')
  expect(trigger().vars.scrub).toBe(0.5)
})

it('creates no trigger without a showcase', () => {
  document.body.replaceChildren()
  renderDriver()

  expect(ScrollTrigger.getAll()).toHaveLength(0)
})

it('maps the scroll progress to the stage position', () => {
  const { result, wrapper } = renderDriver()

  act(() => {
    trigger().animation!.progress(0.3)
  })

  expect(result.current.current).toBeCloseTo(0.5)
  expect(wrapper.current).toHaveAttribute('data-story-progress', '0.50')
})

it('invalidates the frame when the progress updates', () => {
  renderDriver()
  invalidate.mockClear()

  act(() => {
    trigger().animation!.progress(0.3)
  })

  expect(invalidate).toHaveBeenCalled()
})

it('kills its scroll trigger on unmount', () => {
  const { unmount } = renderDriver()

  unmount()

  expect(ScrollTrigger.getAll()).toHaveLength(0)
})
