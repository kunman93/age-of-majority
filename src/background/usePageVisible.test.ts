import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { usePageVisible } from './usePageVisible'

function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
}

afterEach(() => vi.restoreAllMocks())

it('is visible while the document is visible', () => {
  setVisibility('visible')

  const { result } = renderHook(() => usePageVisible())

  expect(result.current).toBe(true)
})

it('follows visibilitychange', () => {
  setVisibility('visible')
  const { result } = renderHook(() => usePageVisible())

  act(() => {
    setVisibility('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current).toBe(false)

  act(() => {
    setVisibility('visible')
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current).toBe(true)
})

it('stops listening on unmount', () => {
  const remove = vi.spyOn(document, 'removeEventListener')
  const { unmount } = renderHook(() => usePageVisible())

  unmount()

  expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
})
