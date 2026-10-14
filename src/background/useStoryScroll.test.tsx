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

  expect(result.current.progress.current).toBe(0)
})

it('creates the morph, entry and exit scroll triggers over the showcase', () => {
  renderDriver()

  const [morph, entry, exit] = ScrollTrigger.getAll()
  expect(ScrollTrigger.getAll()).toHaveLength(3)
  for (const created of [morph, entry, exit]) {
    expect(created.trigger).toBe(showcase)
    expect(created.vars.scrub).toBe(0.5)
  }
  expect([morph.vars.start, morph.vars.end]).toEqual([
    'top top',
    'bottom bottom',
  ])
  expect([entry.vars.start, entry.vars.end]).toEqual(['top bottom', 'top top'])
  expect([exit.vars.start, exit.vars.end]).toEqual([
    'bottom bottom',
    'bottom top',
  ])
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

  expect(result.current.progress.current).toBeCloseTo(0.5)
  expect(wrapper.current).toHaveAttribute('data-story-progress', '0.50')
})

it('follows the entry scroll position', () => {
  const { result, wrapper } = renderDriver()

  act(() => {
    ScrollTrigger.getAll()[1].animation!.progress(0.4)
  })

  expect(result.current.entry.current).toBeCloseTo(0.4)
  expect(wrapper.current).toHaveAttribute('data-story-entry', '0.40')
})

it('follows the exit scroll position', () => {
  const { result, wrapper } = renderDriver()

  act(() => {
    ScrollTrigger.getAll()[2].animation!.progress(0.7)
  })

  expect(result.current.exit.current).toBeCloseTo(0.7)
  expect(wrapper.current).toHaveAttribute('data-story-exit', '0.70')
})

it('invalidates the frame when the progress updates', () => {
  renderDriver()
  invalidate.mockClear()

  act(() => {
    trigger().animation!.progress(0.3)
  })

  expect(invalidate).toHaveBeenCalled()
})

it('kills its scroll triggers on unmount', () => {
  const { unmount } = renderDriver()

  unmount()

  expect(ScrollTrigger.getAll()).toHaveLength(0)
})
