import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useSceneMode } from './useSceneMode'

function stubWebGL(supported: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    supported ? ({ getExtension: () => null } as never) : null,
  )
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

it('is the scene with motion and WebGL', () => {
  stubWebGL(true)

  const { result } = renderHook(() => useSceneMode())

  expect(result.current.mode).toBe('scene')
})

it('is static with reduced motion, without probing WebGL', () => {
  stubReducedMotion(true)
  stubWebGL(true)

  const { result } = renderHook(() => useSceneMode())

  expect(result.current.mode).toBe('static')
  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled()
})

it('is static without WebGL', () => {
  stubWebGL(false)

  const { result } = renderHook(() => useSceneMode())

  expect(result.current.mode).toBe('static')
})

it('probes WebGL only once', () => {
  stubWebGL(true)

  const { rerender } = renderHook(() => useSceneMode())
  rerender()
  rerender()

  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(1)
})

it('switches to static when reduced motion is turned on live', () => {
  let matches = false
  let onChange = () => {}
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return matches
    },
    addEventListener: (_: string, listener: () => void) => {
      onChange = listener
    },
    removeEventListener: vi.fn(),
  }))
  stubWebGL(true)
  const { result } = renderHook(() => useSceneMode())

  act(() => {
    matches = true
    onChange()
  })

  expect(result.current.mode).toBe('static')
})

it('switches to static when the scene fails', () => {
  stubWebGL(true)
  const { result } = renderHook(() => useSceneMode())

  act(() => result.current.fallBackToStatic())

  expect(result.current.mode).toBe('static')
})
