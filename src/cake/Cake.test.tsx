import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollTrigger } from '../gsap'
import Cake from './Cake'

const canvas = vi.hoisted(() => ({ fail: false }))

vi.mock('./CakeCanvas', () => ({
  default: ({ blown }: { blown: boolean }) => {
    if (canvas.fail) throw new Error('the scene failed to load')
    return <span data-cake-canvas data-blown={blown} />
  },
}))

const LIT_HINT = 'Tap the cake to blow out the candles'

afterEach(() => {
  canvas.fail = false
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

it('fades the hint in only once the cake has come into view', () => {
  renderCake()
  const hint = screen.getByText(LIT_HINT)
  const trigger = cakeTrigger()!
  // jsdom may already report the cake as in view, so start from a reset
  act(() => trigger.vars.onLeaveBack!(trigger))
  expect(hint).toHaveClass('opacity-0')
  expect(hint).not.toHaveClass('motion-safe:animate-hint-in')

  act(() => trigger.vars.onEnter!(trigger))
  expect(hint).toHaveClass('motion-safe:animate-hint-in')
  expect(hint).not.toHaveClass('opacity-0')

  act(() => trigger.vars.onLeaveBack!(trigger))
  expect(hint).toHaveClass('opacity-0')
})

it('shows the blown hint at once', () => {
  renderCake()
  fireEvent.click(screen.getByRole('button'))

  expect(screen.getByText('Make a wish!')).not.toHaveClass('opacity-0')
})

it('shows the halo while lit and removes it once blown', () => {
  const { container } = renderCake()
  expect(container.querySelector('[data-cake-halo]')).not.toBeNull()

  fireEvent.click(screen.getByRole('button'))

  expect(container.querySelector('[data-cake-halo]')).toBeNull()
})

it('kills its trigger on unmount', () => {
  const { unmount } = renderCake()
  expect(cakeTrigger()).toBeDefined()

  unmount()

  expect(ScrollTrigger.getAll()).toHaveLength(0)
})

describe('scene mode', () => {
  const renderScene = (onSceneError = vi.fn()) =>
    render(<Cake mode="scene" onSceneError={onSceneError} />)

  it('renders the canvas inside the button and no illustration', async () => {
    const { container } = renderScene()

    const canvasElement = await waitFor(() => {
      const found = container.querySelector('[data-cake-canvas]')
      expect(found).not.toBeNull()
      return found
    })
    expect(screen.getByRole('button')).toContainElement(
      canvasElement as HTMLElement,
    )
    expect(container.querySelector('[data-cake-illustration]')).toBeNull()
  })

  it('passes the blown state to the canvas', async () => {
    const { container } = renderScene()
    await waitFor(() =>
      expect(container.querySelector('[data-cake-canvas]')).not.toBeNull(),
    )

    fireEvent.click(screen.getByRole('button'))

    expect(container.querySelector('[data-cake-canvas]')).toHaveAttribute(
      'data-blown',
      'true',
    )
  })

  const setPointerCapture = vi.fn()
  const drag = (button: HTMLElement, distance: number) => {
    // jsdom has no pointer capture
    setPointerCapture.mockClear()
    button.setPointerCapture = setPointerCapture
    fireEvent.pointerDown(button, { pointerId: 1, clientX: 100 })
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 100 + distance })
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 100 + distance })
  }

  it('keeps the candles lit when a drag ends in a click', () => {
    renderScene()
    const button = screen.getByRole('button')

    drag(button, 40)
    expect(setPointerCapture).toHaveBeenCalledWith(1)
    fireEvent.click(button, { detail: 1 })

    expect(button).toHaveAttribute('data-cake-state', 'lit')
  })

  it('blows out after a plain click or a tiny movement', () => {
    renderScene()
    const button = screen.getByRole('button')

    drag(button, 3)
    fireEvent.click(button, { detail: 1 })

    expect(button).toHaveAttribute('data-cake-state', 'blown')
  })

  it('blows out on a keyboard click after a drag without a click', () => {
    renderScene()
    const button = screen.getByRole('button')

    drag(button, 40)
    fireEvent.click(button, { detail: 0 })

    expect(button).toHaveAttribute('data-cake-state', 'blown')
  })

  it('reports a scene that fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    canvas.fail = true
    const onSceneError = vi.fn()

    renderScene(onSceneError)

    await waitFor(() => expect(onSceneError).toHaveBeenCalled())
    vi.restoreAllMocks()
  })
})

it('renders the illustration and no canvas in static mode', () => {
  const { container } = renderCake()

  expect(container.querySelector('[data-cake-illustration]')).not.toBeNull()
  expect(container.querySelector('[data-cake-canvas]')).toBeNull()
})

it('keeps the blown state when the mode switches', async () => {
  const { container, rerender } = renderCake()
  fireEvent.click(screen.getByRole('button'))

  rerender(<Cake mode="scene" onSceneError={vi.fn()} />)

  expect(screen.getByRole('button')).toHaveAttribute('data-cake-state', 'blown')
  await waitFor(() =>
    expect(container.querySelector('[data-cake-canvas]')).toHaveAttribute(
      'data-blown',
      'true',
    ),
  )
})
