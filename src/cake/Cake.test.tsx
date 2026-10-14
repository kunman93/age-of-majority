import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ScrollTrigger } from '../gsap'
import Cake from './Cake'

const LIT_HINT = 'Tap the cake to blow out the candles'

afterEach(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

const renderCake = () => render(<Cake mode="static" onSceneError={vi.fn()} />)
const cakeTrigger = () =>
  ScrollTrigger.getAll().find(
    (trigger) => trigger.trigger === screen.getByRole('button'),
  )

it('names the button after its visible hint and shows the lit cake', () => {
  const { container } = renderCake()

  const button = screen.getByRole('button', { name: LIT_HINT })
  expect(button).toHaveAttribute('data-cake-state', 'lit')
  expect(button).not.toHaveAttribute('aria-disabled')
  expect(button).toContainElement(
    container.querySelector('[data-cake-illustration]'),
  )
  expect(container.querySelectorAll('[data-flame]')).toHaveLength(18)
})

it('blows out the candles on click', () => {
  const { container } = renderCake()

  fireEvent.click(screen.getByRole('button'))

  const button = screen.getByRole('button', { name: 'Make a wish!' })
  expect(button).toHaveAttribute('data-cake-state', 'blown')
  expect(button).toHaveAttribute('aria-disabled', 'true')
  expect(button).not.toBeDisabled()
  expect(container.querySelectorAll('[data-flame]')).toHaveLength(0)
})

it('keeps the focus on the button after blowing out', () => {
  renderCake()
  const button = screen.getByRole('button')
  button.focus()

  fireEvent.click(button)

  expect(button).toHaveFocus()
})

it('ignores further clicks once blown out', () => {
  renderCake()
  const button = screen.getByRole('button')
  button.focus()

  fireEvent.click(button)
  fireEvent.click(button)

  expect(button).toHaveAccessibleName('Make a wish!')
  expect(button).toHaveAttribute('data-cake-state', 'blown')
  expect(button).toHaveFocus()
})

it('resets to lit when scrolling back above the cake', () => {
  renderCake()
  fireEvent.click(screen.getByRole('button'))

  const trigger = cakeTrigger()!
  expect(trigger.vars.start).toBe('top bottom')
  act(() => trigger.vars.onLeaveBack!(trigger))

  const button = screen.getByRole('button', { name: LIT_HINT })
  expect(button).toHaveAttribute('data-cake-state', 'lit')
  expect(button).not.toHaveAttribute('aria-disabled')
})

it('blows out again after a reset', () => {
  renderCake()
  fireEvent.click(screen.getByRole('button'))
  const trigger = cakeTrigger()!
  act(() => trigger.vars.onLeaveBack!(trigger))

  fireEvent.click(screen.getByRole('button'))

  expect(screen.getByRole('button')).toHaveAccessibleName('Make a wish!')
})

it('kills its trigger on unmount', () => {
  const { unmount } = renderCake()
  expect(cakeTrigger()).toBeDefined()

  unmount()

  expect(ScrollTrigger.getAll()).toHaveLength(0)
})
