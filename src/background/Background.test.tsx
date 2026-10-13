import { act, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import App from '../App'
import Background from './Background'

const canvas = vi.hoisted(() => ({ fail: false }))

vi.mock('./EmberCanvas', () => ({
  default: ({ paused }: { paused: boolean }) => {
    if (canvas.fail) throw new Error('renderer failed')
    return <div data-testid="ember-canvas" data-paused={paused} />
  },
}))

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

function stubWebGL(supported: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    supported ? ({ getExtension: () => null } as never) : null,
  )
}

beforeEach(() => {
  canvas.fail = false
})

it('always shows the static glow', async () => {
  stubWebGL(true)

  render(<Background />)

  expect(screen.getByTestId('background-glow')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await screen.findByTestId('ember-canvas')
  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
})

it('shows only the glow, and loads no scene, with reduced motion', () => {
  stubReducedMotion(true)
  stubWebGL(true)

  render(<Background />)

  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
  expect(screen.queryByTestId('ember-canvas')).toBeNull()
})

it('does not probe WebGL with reduced motion', () => {
  stubReducedMotion(true)
  stubWebGL(true)

  render(<Background />)

  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled()
})

it('shows only the glow, and loads no scene, without WebGL', () => {
  stubWebGL(false)

  render(<Background />)

  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
  expect(screen.queryByTestId('ember-canvas')).toBeNull()
})

it('unmounts the canvas when reduced motion is switched on live', async () => {
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
  render(<Background />)
  await screen.findByTestId('ember-canvas')

  act(() => {
    matches = true
    onChange()
  })

  expect(screen.queryByTestId('ember-canvas')).toBeNull()
  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
})

it('renders the canvas when motion and WebGL are available', async () => {
  stubWebGL(true)

  render(<Background />)

  expect(await screen.findByTestId('ember-canvas')).toHaveAttribute(
    'data-paused',
    'false',
  )
})

it('pauses the canvas while the page is hidden', async () => {
  stubWebGL(true)
  render(<Background />)
  const embers = await screen.findByTestId('ember-canvas')

  act(() => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
  })

  expect(embers).toHaveAttribute('data-paused', 'true')
})

it('keeps the glow and the card when the canvas throws', async () => {
  stubWebGL(true)
  canvas.fail = true
  vi.spyOn(console, 'error').mockImplementation(() => {})

  render(<App />)

  await act(() => Promise.resolve())
  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
  expect(screen.queryByTestId('ember-canvas')).toBeNull()
  expect(
    screen.getByRole('heading', { name: 'Happy 18th Birthday, Sara!' }),
  ).toBeInTheDocument()
})
