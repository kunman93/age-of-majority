import { render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { gsap, ScrollTrigger } from '../gsap'
import TypedIntro from './TypedIntro'
import { addTypewriter } from './typewriter'

const FIRST = 'Hello there, Sara.'
const SECOND = 'Welcome to the card!'
const TEXT = `${FIRST} ${SECOND}`
const TYPING_SECONDS = (sentence: string) => sentence.length * 0.03
const ERASING_SECONDS = (sentence: string) => sentence.length * 0.015
const HOLD_SECONDS = 2

afterEach(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

const setup = () => {
  const { container } = render(
    <div data-opening>
      <TypedIntro text={TEXT} />
    </div>,
  )
  const intro = container.querySelector<HTMLElement>('[data-intro]')!
  const opening = container.querySelector<HTMLElement>('[data-opening]')!
  const timeline = gsap.timeline({ paused: true })
  let typewriter!: ReturnType<typeof addTypewriter>
  const context = gsap.context(() => {
    typewriter = addTypewriter(timeline, intro, opening)
  })
  const lines = [...intro.querySelectorAll<HTMLElement>('[data-sentence-line]')]
  const typed = (index: number) =>
    lines[index].querySelector<HTMLElement>('[data-typed-text]')!
  const untyped = (index: number) =>
    lines[index].querySelector<HTMLElement>('[data-untyped-text]')!
  const at = (seconds: number) => typewriter.loop.totalTime(seconds, false)
  return { intro, lines, typed, untyped, at, typewriter, context }
}

it('shows the full text, no cursor and the done marker by default', () => {
  const { container } = render(<TypedIntro text={TEXT} />)

  const intro = container.querySelector('[data-intro]')!
  expect(intro).toHaveAttribute('data-typed', 'done')
  expect(intro.querySelector('[data-full-text]')).toHaveTextContent(TEXT)
  expect(intro.querySelector('[data-full-text]')).not.toHaveClass('hidden')
  intro
    .querySelectorAll('[data-sentence-line]')
    .forEach((line) => expect(line).toHaveClass('hidden'))
  intro
    .querySelectorAll('[data-cursor]')
    .forEach((cursor) => expect(cursor).toHaveClass('opacity-0'))
})

it('gives assistive technology the full text and hides the typed copy', () => {
  const { container } = render(<TypedIntro text={TEXT} />)

  expect(container.querySelector('.sr-only')).toHaveTextContent(TEXT)
  expect(
    container.querySelector('[data-full-text]')!.closest('[aria-hidden]'),
  ).toHaveAttribute('aria-hidden', 'true')
  expect(
    container.querySelector('[data-cursor]')!.closest('[aria-hidden]'),
  ).toHaveAttribute('aria-hidden', 'true')
})

it('renders one stacked line per sentence in a single grid cell', () => {
  const { container } = render(<TypedIntro text={TEXT} />)

  const lines = container.querySelectorAll('[data-sentence-line]')
  expect(lines).toHaveLength(2)
  lines.forEach((line) =>
    expect(line).toHaveClass('col-start-1', 'row-start-1'),
  )
})

it('starts with the first sentence untyped and the rest kept in the layout', () => {
  const { intro, lines, typed, untyped } = setup()

  expect(intro).toHaveAttribute('data-typed', 'typing')
  expect(intro).toHaveAttribute('data-sentence', '0')
  expect(typed(0)).toBeEmptyDOMElement()
  expect(untyped(0)).toHaveTextContent(FIRST)
  expect(untyped(1)).toHaveTextContent(SECOND)
  lines.forEach((line) => expect(line.style.display).toBe('block'))
  expect(
    intro.querySelector<HTMLElement>('[data-full-text]')!.style.display,
  ).toBe('none')
})

it('types the first sentence at about 30 ms per character', () => {
  const { intro, lines, typed, untyped, at } = setup()

  at(TYPING_SECONDS(FIRST) / 2)

  expect(intro).toHaveAttribute('data-typed', 'typing')
  expect(lines[0].style.opacity).toBe('1')
  expect(lines[1].style.opacity).toBe('0')
  expect(typed(0).textContent!.length).toBeGreaterThan(0)
  expect(typed(0).textContent! + untyped(0).textContent!).toBe(FIRST)
  expect(FIRST.startsWith(typed(0).textContent!)).toBe(true)
})

it('shows the whole sentence while it is held', () => {
  const { intro, typed, untyped, at } = setup()

  at(TYPING_SECONDS(FIRST) + HOLD_SECONDS / 2)

  expect(intro).toHaveAttribute('data-typed', 'shown')
  expect(typed(0)).toHaveTextContent(FIRST)
  expect(untyped(0)).toBeEmptyDOMElement()
})

it('erases the sentence before the next one is typed in its place', () => {
  const { intro, lines, typed, at } = setup()
  const erasing = TYPING_SECONDS(FIRST) + HOLD_SECONDS

  at(erasing + ERASING_SECONDS(FIRST) / 2)

  expect(intro).toHaveAttribute('data-typed', 'erasing')
  expect(typed(0).textContent!.length).toBeLessThan(FIRST.length)
  expect(typed(0).textContent!.length).toBeGreaterThan(0)

  at(erasing + ERASING_SECONDS(FIRST) + 0.1)

  expect(intro).toHaveAttribute('data-sentence', '1')
  expect(intro).toHaveAttribute('data-typed', 'typing')
  expect(lines[0].style.opacity).toBe('0')
  expect(lines[1].style.opacity).toBe('1')
})

it('starts again with the first sentence after the last one', () => {
  const { intro, typewriter, typed, at } = setup()
  const duration = typewriter.loop.duration()

  at(duration - 0.05)
  expect(intro).toHaveAttribute('data-sentence', '1')

  at(duration + 0.1)

  expect(intro).toHaveAttribute('data-sentence', '0')
  expect(intro).toHaveAttribute('data-typed', 'typing')
  expect(typed(0).textContent!.length).toBeGreaterThan(0)
})

it('repeats the loop forever', () => {
  const { typewriter } = setup()

  expect(typewriter.loop.repeat()).toBe(-1)
})

it('starts only when the load timeline reaches it', () => {
  const { typewriter } = setup()

  expect(typewriter.loop.paused()).toBe(true)
})

it('pauses while the opening is scrolled away and resumes where it stopped', () => {
  const { intro, typewriter, at } = setup()
  const trigger = ScrollTrigger.getAll()[0]
  expect(trigger.vars.start).toBe('top top')
  expect(trigger.vars.end).toBe('bottom top')

  typewriter.loop.paused(false)
  at(0.3)
  trigger.vars.onLeave!(trigger)
  expect(typewriter.loop.paused()).toBe(true)
  expect(intro).toHaveAttribute('data-typed', 'typing')

  trigger.vars.onEnterBack!(trigger)
  expect(typewriter.loop.paused()).toBe(false)
  expect(typewriter.loop.time()).toBeCloseTo(0.3)
})

it('restores the full text and hides every cursor on revert', () => {
  const { intro, lines, typed, untyped, at, typewriter, context } = setup()
  at(0.3)

  context.revert()
  typewriter.restore()

  expect(intro).toHaveAttribute('data-typed', 'done')
  expect(intro).not.toHaveAttribute('data-sentence')
  expect(
    intro.querySelector<HTMLElement>('[data-full-text]')!.style.display,
  ).toBe('')
  lines.forEach((line, index) => {
    expect(line.style.display).toBe('')
    expect(line.style.opacity).toBe('')
    expect(typed(index)).toBeEmptyDOMElement()
    expect(
      line.querySelector<HTMLElement>('[data-cursor]')!.style.opacity,
    ).toBe('')
  })
  expect(untyped(0)).toHaveTextContent(FIRST)
  expect(untyped(1)).toHaveTextContent(SECOND)
})
