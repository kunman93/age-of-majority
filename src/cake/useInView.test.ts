import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useInView } from './useInView'

let callback: IntersectionObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(onChange: IntersectionObserverCallback) {
        callback = onChange
      }
      observe = observe
      disconnect = disconnect
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

const report = (isIntersecting: boolean) =>
  act(() =>
    callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  )

function renderInView() {
  const element = document.createElement('div')
  return renderHook(() => useInView({ current: element }))
}

it('is out of view until the observer reports otherwise', () => {
  const { result } = renderInView()

  expect(result.current).toBe(false)
})

it('observes the element and follows its intersection', () => {
  const { result } = renderInView()
  expect(observe).toHaveBeenCalledTimes(1)

  report(true)
  expect(result.current).toBe(true)

  report(false)
  expect(result.current).toBe(false)
})

it('uses the latest entry when several are batched', () => {
  const { result } = renderInView()

  act(() =>
    callback(
      [
        { isIntersecting: true },
        { isIntersecting: false },
      ] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    ),
  )

  expect(result.current).toBe(false)
})

it('disconnects on unmount', () => {
  const { unmount } = renderInView()

  unmount()

  expect(disconnect).toHaveBeenCalled()
})
