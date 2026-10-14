import { act, render, renderHook, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../App'
import { ScrollTrigger } from '../gsap'
import type { SceneMode } from '../background/useSceneMode'
import { useChoreography } from './useChoreography'

vi.mock('../background/useSceneMode', () => ({
  useSceneMode: () => ({ mode: 'static', fallBackToStatic: () => {} }),
}))

vi.mock('../background/Background', () => ({ default: () => null }))

const NO_PREFERENCE = '(prefers-reduced-motion: no-preference)'

function stubReducedMotion(reduce: boolean) {
  const listeners = new Set<() => void>()
  let reduced = reduce
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === NO_PREFERENCE ? !reduced : false
    },
    media: query,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
    addListener: (listener: () => void) => listeners.add(listener),
    removeListener: (listener: () => void) => listeners.delete(listener),
  }))
  return (next: boolean) => {
    reduced = next
    listeners.forEach((listener) => listener())
  }
}

const inlineOpacities = () =>
  [
    ...document.querySelectorAll<HTMLElement>(
      '[data-reveal], h1, [data-opening]',
    ),
  ]
    .map((element) => element.style.opacity)
    .filter(Boolean)

afterEach(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

it('sets no inline opacity on any target with reduced motion', () => {
  stubReducedMotion(true)

  render(<App />)

  expect(inlineOpacities()).toEqual([])
  expect(ScrollTrigger.getAll()).toHaveLength(0)
})

it('takes over the targets before the first paint without reduced motion', () => {
  stubReducedMotion(false)

  render(<App />)

  expect(screen.getByRole('heading', { level: 1 }).style.opacity).toBe('0')
  document
    .querySelectorAll<HTMLElement>('[data-reveal]')
    .forEach((element) => expect(element.style.opacity).not.toBe(''))
})

it('keeps unrevealed content visible to assistive technology', () => {
  stubReducedMotion(false)

  render(<App />)

  const hidden = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    .map((element) => element.style.visibility)
    .filter(Boolean)
  expect(hidden).toEqual([])
  expect(
    screen.getByRole('heading', { name: 'Family Dolor' }),
  ).toBeInTheDocument()
})

it('gives the opening a scrubbed fade-out over its scroll', () => {
  stubReducedMotion(false)

  render(<App />)

  const opening = document.querySelector('[data-opening]')
  const fade = ScrollTrigger.getAll().find(
    (trigger) => trigger.trigger === opening,
  )!
  expect(fade.vars.start).toBe('top top')
  expect(fade.vars.end).toBe('bottom top')
  expect(fade.vars.scrub).toBeTruthy()
})

it('reveals each target before its top reaches the middle', () => {
  stubReducedMotion(false)

  render(<App />)

  const reveals = ScrollTrigger.getAll().filter((trigger) =>
    (trigger.trigger as HTMLElement).hasAttribute('data-reveal'),
  )
  expect(reveals).toHaveLength(
    document.querySelectorAll('[data-reveal]').length,
  )
  reveals.forEach((reveal) => {
    expect(reveal.vars.start).toBe('top bottom')
    expect(reveal.vars.end).toBe('clamp(top 60%)')
  })
})

it('restores the final state when reduced motion is switched on live', () => {
  const setReduced = stubReducedMotion(false)
  render(<App />)
  expect(inlineOpacities().length).toBeGreaterThan(0)

  act(() => setReduced(true))

  expect(inlineOpacities()).toEqual([])
  expect(ScrollTrigger.getAll()).toHaveLength(0)
})

it('kills its scroll triggers on unmount', () => {
  stubReducedMotion(false)
  const { unmount } = render(<App />)

  unmount()

  expect(ScrollTrigger.getAll()).toHaveLength(0)
})

it('refreshes the scroll positions when the mode changes', () => {
  stubReducedMotion(false)
  const scope = { current: document.createElement('main') }
  const { rerender } = renderHook(
    ({ mode }: { mode: SceneMode }) => useChoreography(scope, mode),
    { initialProps: { mode: 'scene' as SceneMode } },
  )
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')

  rerender({ mode: 'static' })

  expect(refresh).toHaveBeenCalled()
})
