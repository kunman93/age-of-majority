import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { gsap } from '../gsap'
import TypedIntro from './TypedIntro'
import { addTypewriter } from './typewriter'

const TEXT = 'Hello there, Sara'

const setup = () => {
  const { container } = render(<TypedIntro text={TEXT} />)
  const intro = container.querySelector<HTMLElement>('[data-intro]')!
  const timeline = gsap.timeline({ paused: true })
  let restore = () => {}
  const context = gsap.context(() => {
    restore = addTypewriter(timeline, intro)
  })
  const part = (name: string) =>
    intro.querySelector<HTMLElement>(`[data-${name}]`)!
  return { intro, timeline, restore, context, part }
}

it('shows the full text, no cursor and the done marker by default', () => {
  const { container } = render(<TypedIntro text={TEXT} />)

  const intro = container.querySelector('[data-intro]')!
  expect(intro).toHaveAttribute('data-typed', 'done')
  expect(intro.querySelector('[data-typed-text]')).toHaveTextContent(TEXT)
  expect(intro.querySelector('[data-untyped-text]')).toBeEmptyDOMElement()
  expect(intro.querySelector('[data-cursor]')).toHaveClass('opacity-0')
})

it('gives assistive technology the full text and hides the typed copy', () => {
  const { container } = render(<TypedIntro text={TEXT} />)

  expect(container.querySelector('.sr-only')).toHaveTextContent(TEXT)
  expect(
    container.querySelector('[data-typed-text]')!.closest('[aria-hidden]'),
  ).toHaveAttribute('aria-hidden', 'true')
  expect(
    container.querySelector('[data-cursor]')!.closest('[aria-hidden]'),
  ).toHaveAttribute('aria-hidden', 'true')
})

it('starts with nothing typed and keeps the rest in the layout', () => {
  const { intro, part } = setup()

  expect(intro).toHaveAttribute('data-typed', 'typing')
  expect(part('typed-text')).toBeEmptyDOMElement()
  expect(part('untyped-text')).toHaveTextContent(TEXT)
})

it('splits the text at the typed character count', () => {
  const { timeline, part } = setup()

  timeline.seek(0.25, false)

  const typed = part('typed-text').textContent!
  expect(typed.length).toBeGreaterThan(0)
  expect(typed + part('untyped-text').textContent).toBe(TEXT)
  expect(TEXT.startsWith(typed)).toBe(true)
})

it('types about 30 ms per character', () => {
  const { timeline } = setup()
  const typing = timeline.getChildren().find((child) => child.duration() > 0.1)!

  expect(typing.duration()).toBeCloseTo(TEXT.length * 0.03)
})

it('marks the intro done and fades the cursor out after the last character', () => {
  const { intro, timeline, part } = setup()

  timeline.progress(1)

  expect(intro).toHaveAttribute('data-typed', 'done')
  expect(part('typed-text')).toHaveTextContent(TEXT)
  expect(part('untyped-text')).toBeEmptyDOMElement()
  expect(part('cursor').style.opacity).toBe('0')
})

it('restores the full text and hides the cursor on revert', () => {
  const { intro, timeline, restore, context, part } = setup()
  timeline.seek(0.2, false)

  context.revert()
  restore()

  expect(intro).toHaveAttribute('data-typed', 'done')
  expect(part('typed-text')).toHaveTextContent(TEXT)
  expect(part('untyped-text')).toBeEmptyDOMElement()
  expect(part('cursor').style.opacity).toBe('')
})
