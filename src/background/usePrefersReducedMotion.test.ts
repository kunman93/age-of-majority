import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

function stubReducedMotion(initial: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    matches: initial,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  }
  const matchMedia = vi.fn(() => query)
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    listeners,
    change(matches: boolean) {
      query.matches = matches
      listeners.forEach((listener) => listener())
    },
  }
}

it('reads the reduced motion preference', () => {
  const { matchMedia } = stubReducedMotion(true)

  const { result } = renderHook(() => usePrefersReducedMotion())

  expect(result.current).toBe(true)
  expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
})

it('follows the preference when it changes', () => {
  const media = stubReducedMotion(false)
  const { result } = renderHook(() => usePrefersReducedMotion())
  expect(result.current).toBe(false)

  act(() => media.change(true))

  expect(result.current).toBe(true)
})

it('stops listening on unmount', () => {
  const media = stubReducedMotion(false)
  const { unmount } = renderHook(() => usePrefersReducedMotion())

  unmount()

  expect(media.listeners.size).toBe(0)
})
