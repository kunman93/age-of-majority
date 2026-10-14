import { act, render, renderHook, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../App'
import { gsap, ScrollTrigger } from '../gsap'
import type { SceneMode } from '../background/useSceneMode'
import TypedIntro from './TypedIntro'
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

// the cake keeps its own reset trigger whatever the motion preference
const choreographyTriggers = () =>
  ScrollTrigger.getAll().filter(
    (trigger) =>
      !(trigger.trigger as Element | null)?.closest('[data-cake-state]'),
  )

afterEach(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

it('sets no inline opacity on any target with reduced motion', () => {
  stubReducedMotion(true)

  render(<App />)

  expect(inlineOpacities()).toEqual([])
  expect(choreographyTriggers()).toHaveLength(0)
})

it('shows the full intro and no cursor with reduced motion', () => {
  stubReducedMotion(true)

  render(<App />)

  const intro = document.querySelector('[data-intro]')!
  const full = intro.querySelector<HTMLElement>('[data-full-text]')!
  expect(intro).toHaveAttribute('data-typed', 'done')
  expect(full.textContent).toMatch(
    /^Today you come of age.*what they have to say\.$/,
  )
  expect(full.style.display).toBe('')
  expect(full).not.toHaveClass('hidden')
  intro
    .querySelectorAll<HTMLElement>('[data-sentence-line]')
    .forEach((line) => expect(line).toHaveClass('hidden'))
  intro.querySelectorAll<HTMLElement>('[data-cursor]').forEach((cursor) => {
    expect(cursor).toHaveClass('opacity-0')
    expect(cursor.style.opacity).toBe('')
  })
})

it('types the intro sentence by sentence without reduced motion', () => {
  stubReducedMotion(false)

  render(<App />)

  const intro = document.querySelector('[data-intro]')!
  expect(intro).toHaveAttribute('data-typed', 'typing')
  expect(intro).toHaveAttribute('data-sentence', '0')
  expect(intro.querySelectorAll('[data-sentence-line]')).toHaveLength(3)
  expect(intro.querySelector('[data-typed-text]')).toBeEmptyDOMElement()
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
    (trigger) => trigger.trigger === opening && trigger.vars.scrub,
  )!
  expect(fade.vars.start).toBe('top top')
  expect(fade.vars.end).toBe('bottom top')
  expect(fade.vars.scrub).toBeTruthy()
})

it('reveals each target before its top reaches the middle', () => {
  stubReducedMotion(false)

  render(<App />)

  // the cards are revealed by the board's timeline, not by their own triggers
  const reveals = ScrollTrigger.getAll().filter((trigger) => {
    const element = trigger.trigger as HTMLElement
    return (
      element.hasAttribute('data-reveal') &&
      element.getAttribute('data-reveal') !== 'card'
    )
  })
  expect(reveals).toHaveLength(
    document.querySelectorAll('[data-reveal]:not([data-reveal="card"])').length,
  )
  reveals.forEach((reveal) => {
    expect(reveal.vars.start).toBe('top bottom')
    expect(reveal.vars.end).toBe('clamp(top 60%)')
  })
})

const inlineTransforms = () =>
  [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    .map((element) => element.style.transform)
    .filter((transform) => transform && transform !== 'none')

const tweenVarsOf = (element: HTMLElement) =>
  gsap.getTweensOf(element).map((tween) => tween.vars)

const cardSlots = () => [
  ...document.querySelectorAll<HTMLElement>('[data-reveal="card"]'),
]

it('sets no inline opacity or transform on the cards with reduced motion', () => {
  stubReducedMotion(true)

  render(<App />)

  const cards = cardSlots()
  expect(cards).toHaveLength(document.querySelectorAll('figure').length)
  cards.forEach((card) => {
    expect(card.style.opacity).toBe('')
    expect(card.style.transform).toBe('')
  })
  expect(inlineTransforms()).toEqual([])
})

it('slides the cards in from alternating sides by their global index and fades them in', () => {
  stubReducedMotion(false)

  render(<App />)

  const cards = cardSlots()
  expect(cards.length).toBeGreaterThan(2)
  cards.forEach((card, index) => {
    const sign = index % 2 === 0 ? -1 : 1
    const vars = tweenVarsOf(card)
    expect(vars).toHaveLength(2)
    expect(vars).toContainEqual(
      expect.objectContaining({ opacity: 0, ease: 'none' }),
    )
    expect(vars).toContainEqual(
      expect.objectContaining({ x: sign * 100, ease: 'back.inOut(3)' }),
    )
    vars.forEach((tween) => expect(tween).not.toHaveProperty('y'))
  })
})

it('keeps the fade-and-rise for the headings and the finale', () => {
  stubReducedMotion(false)

  render(<App />)

  const others = [
    ...document.querySelectorAll<HTMLElement>(
      '[data-reveal]:not([data-reveal="card"])',
    ),
  ]
  expect(others.length).toBeGreaterThan(0)
  others.forEach((element) =>
    expect(tweenVarsOf(element)).toEqual([
      expect.objectContaining({ opacity: 0, y: 40, ease: 'none' }),
    ]),
  )
})

it('reveals all cards with one scrubbed timeline on the board', () => {
  stubReducedMotion(false)

  render(<App />)

  const board = document.querySelector('[data-board]')
  const boardTriggers = ScrollTrigger.getAll().filter(
    (trigger) => trigger.trigger === board,
  )
  expect(boardTriggers).toHaveLength(1)
  expect(boardTriggers[0].vars).toMatchObject({
    start: 'top bottom',
    end: 'clamp(top 40%)',
    scrub: 0.5,
  })
  const cardTriggers = ScrollTrigger.getAll().filter((trigger) =>
    cardSlots().includes(trigger.trigger as HTMLElement),
  )
  expect(cardTriggers).toEqual([])
})

it('staggers the cards by 0.15 per global index in that timeline', () => {
  stubReducedMotion(false)

  render(<App />)

  cardSlots().forEach((card, index) => {
    const tweens = gsap.getTweensOf(card)
    expect(tweens).toHaveLength(2)
    tweens.forEach((tween) =>
      expect(tween.startTime()).toBeCloseTo(index * 0.15, 5),
    )
  })
})

it('restores the final state when reduced motion is switched on live', () => {
  const setReduced = stubReducedMotion(false)
  render(<App />)
  expect(inlineOpacities().length).toBeGreaterThan(0)

  act(() => setReduced(true))

  expect(inlineOpacities()).toEqual([])
  expect(choreographyTriggers()).toHaveLength(0)
})

it('kills its scroll triggers on unmount', () => {
  stubReducedMotion(false)
  const { unmount } = render(<App />)

  unmount()

  expect(choreographyTriggers()).toHaveLength(0)
})

it('does not replay the opening when the mode changes', () => {
  stubReducedMotion(false)
  const main = document.createElement('main')
  main.append(document.createElement('h1'))
  const opening = document.createElement('div')
  opening.dataset.opening = ''
  main.append(opening)
  render(<TypedIntro text="Hello. World." />, { container: opening })
  const scope = { current: main }
  const { rerender } = renderHook(
    ({ mode }: { mode: SceneMode }) => useChoreography(scope, mode),
    { initialProps: { mode: 'scene' as SceneMode } },
  )
  const heading = main.querySelector('h1')!
  const intro = main.querySelector<HTMLElement>('[data-intro]')!
  gsap.getTweensOf(heading).forEach((tween) => tween.progress(1))
  intro.dataset.sentence = '1'
  const typed = main.querySelector('[data-typed-text]')!
  typed.textContent = 'Hel'

  rerender({ mode: 'static' })

  expect(heading.style.opacity).not.toBe('0')
  expect(intro.dataset.sentence).toBe('1')
  expect(typed.textContent).toBe('Hel')
})

it('refreshes the scroll positions when the mode changes', () => {
  stubReducedMotion(false)
  const main = document.createElement('main')
  render(<TypedIntro text="Hello" />, { container: main })
  const scope = { current: main }
  const { rerender } = renderHook(
    ({ mode }: { mode: SceneMode }) => useChoreography(scope, mode),
    { initialProps: { mode: 'scene' as SceneMode } },
  )
  const refresh = vi.spyOn(ScrollTrigger, 'refresh')

  rerender({ mode: 'static' })

  expect(refresh).toHaveBeenCalled()
})
