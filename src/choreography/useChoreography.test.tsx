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

const cardSlots = () => [
  ...document.querySelectorAll<HTMLElement>('[data-reveal="card"]'),
]

const revealTargets = (kind: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-reveal="${kind}"]`),
]

const setProgress = (element: HTMLElement, progress: number) =>
  gsap.getTweensOf(element).forEach((tween) => tween.progress(progress))

const placeOf = (element: HTMLElement) => ({
  opacity: Number(element.style.opacity),
  y: Number(gsap.getProperty(element, 'y')),
})

it('drops every heading in from above and fades it in', () => {
  stubReducedMotion(false)
  render(<App />)

  const headings = revealTargets('heading')
  expect(headings.length).toBeGreaterThan(3)
  headings.forEach((heading) => {
    setProgress(heading, 0)
    expect(placeOf(heading).opacity).toBe(0)
    expect(placeOf(heading).y).toBeLessThan(0)

    setProgress(heading, 1)
    expect(placeOf(heading)).toEqual({ opacity: 1, y: 0 })
  })
})

it('fades the finale body in without moving it', () => {
  stubReducedMotion(false)
  render(<App />)

  const [fade] = revealTargets('fade')
  setProgress(fade, 0)
  expect(placeOf(fade)).toEqual({ opacity: 0, y: 0 })

  setProgress(fade, 1)
  expect(placeOf(fade)).toEqual({ opacity: 1, y: 0 })
})

it('fades the greeting in without moving it', () => {
  stubReducedMotion(false)
  render(<App />)

  const greeting = screen.getByRole('heading', { level: 1 })
  expect(placeOf(greeting)).toEqual({ opacity: 0, y: 0 })

  setProgress(greeting, 1)
  expect(placeOf(greeting)).toEqual({ opacity: 1, y: 0 })
})

it('is still fading the greeting in one second after the page loads', () => {
  stubReducedMotion(false)
  render(<App />)

  const greeting = screen.getByRole('heading', { level: 1 })
  gsap.getTweensOf(greeting)[0].parent!.time(1)

  const { opacity, y } = placeOf(greeting)
  expect(opacity).toBeGreaterThan(0)
  expect(opacity).toBeLessThan(1)
  expect(y).toBe(0)
})

it('sets no inline style on any heading or the finale body with reduced motion', () => {
  stubReducedMotion(true)
  render(<App />)

  const targets = [...revealTargets('heading'), ...revealTargets('fade')]
  expect(targets.length).toBeGreaterThan(0)
  targets.forEach((target) => expect(target.getAttribute('style')).toBeNull())
})

const ornaments = (layer: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-ornament-layer="${layer}"]`),
]

const driftOf = (piece: HTMLElement) => {
  setProgress(piece, 0)
  const from = placeOf(piece).y
  setProgress(piece, 1)
  return placeOf(piece).y - from
}

it('drifts every ornament vertically with the scroll, dust faster than blossoms and blossoms faster than stems', () => {
  stubReducedMotion(false)
  render(<App />)

  const [stem] = ornaments('stem')
  const [blossom] = ornaments('blossom')
  const [dust] = ornaments('dust')
  expect(Math.abs(driftOf(stem))).toBeGreaterThan(0)
  expect(Math.abs(driftOf(blossom))).toBeGreaterThan(Math.abs(driftOf(stem)))
  expect(Math.abs(driftOf(dust))).toBeGreaterThan(Math.abs(driftOf(blossom)))
})

it('leaves every ornament still with reduced motion', () => {
  stubReducedMotion(true)
  render(<App />)

  const pieces = document.querySelectorAll<HTMLElement>('[data-ornament]')
  expect(pieces.length).toBeGreaterThan(0)
  pieces.forEach((piece) => expect(piece.getAttribute('style')).toBeNull())
})

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

const setCardsProgress = (progress: number) =>
  ScrollTrigger.getAll()
    .filter((trigger) =>
      (trigger.trigger as Element).hasAttribute('data-cards'),
    )
    .forEach((trigger) => trigger.animation!.progress(progress))

const cardPlace = (card: HTMLElement) => ({
  opacity: Number(card.style.opacity),
  x: Number(gsap.getProperty(card, 'x')),
})

it('slides consecutive cards in from opposite sides and settles them in place', () => {
  stubReducedMotion(false)
  render(<App />)

  const cards = cardSlots()
  expect(cards.length).toBeGreaterThan(2)

  setCardsProgress(0)
  const before = cards.map(cardPlace)
  before.forEach((place) => expect(place.opacity).toBe(0))
  before.forEach((place, index) => {
    expect(place.x).not.toBe(0)
    if (index > 0) {
      expect(Math.sign(place.x)).toBe(-Math.sign(before[index - 1].x))
    }
  })

  setCardsProgress(1)
  cards.forEach((card) => expect(cardPlace(card)).toEqual({ opacity: 1, x: 0 }))
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
