import { act, renderHook } from '@testing-library/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
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

const mockFonts = () => {
  let resolve!: () => void
  const ready = new Promise<void>((done) => {
    resolve = done
  })
  Object.defineProperty(document, 'fonts', {
    value: { ready },
    configurable: true,
  })
  return resolve
}

it('refreshes the scroll trigger once the fonts are ready', async () => {
  const resolve = mockFonts()
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')
  renderDriver()
  refresh.mockClear()

  resolve()
  await Promise.resolve()
  await Promise.resolve()

  expect(refresh).toHaveBeenCalledTimes(1)
})

it('does not refresh after unmount when the fonts resolve late', async () => {
  const resolve = mockFonts()
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')
  const { unmount } = renderDriver()
  unmount()
  refresh.mockClear()

  resolve()
  await Promise.resolve()
  await Promise.resolve()

  expect(refresh).not.toHaveBeenCalled()
})
