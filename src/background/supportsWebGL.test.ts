import { expect, it, vi } from 'vitest'
import { supportsWebGL } from './supportsWebGL'

const context = { getExtension: () => null }

function stubContexts(contexts: Record<string, unknown>) {
  return vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(
      ((type: string) =>
        contexts[type] ?? null) as HTMLCanvasElement['getContext'],
    )
}

it('is false when no WebGL context is available', () => {
  expect(supportsWebGL()).toBe(false)
})

it('is true for a webgl2 context', () => {
  stubContexts({ webgl2: context })

  expect(supportsWebGL()).toBe(true)
})

it('falls back to webgl', () => {
  const getContext = stubContexts({ webgl: context })

  expect(supportsWebGL()).toBe(true)
  expect(getContext.mock.calls.map(([type]) => type)).toEqual([
    'webgl2',
    'webgl',
  ])
})

it('releases the probe context', () => {
  const loseContext = vi.fn()
  stubContexts({
    webgl2: { getExtension: () => ({ loseContext }) },
  })

  supportsWebGL()

  expect(loseContext).toHaveBeenCalledOnce()
})
