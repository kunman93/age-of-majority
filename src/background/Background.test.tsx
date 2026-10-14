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

vi.mock('./StoryCanvas', () => ({ default: () => null }))

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

const renderBackground = (mode: 'scene' | 'static', onSceneError = vi.fn()) =>
  render(<Background mode={mode} onSceneError={onSceneError} />)

it('always shows the static glow', async () => {
  renderBackground('scene')

  expect(screen.getByTestId('background-glow')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await screen.findByTestId('ember-canvas')
  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
})

it('renders only the glow in static mode', () => {
  renderBackground('static')

  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
  expect(screen.queryByTestId('ember-canvas')).toBeNull()
})

it('renders the canvas in scene mode', async () => {
  renderBackground('scene')

  expect(await screen.findByTestId('ember-canvas')).toHaveAttribute(
    'data-paused',
    'false',
  )
})

it('pauses the canvas while the page is hidden', async () => {
  renderBackground('scene')
  const embers = await screen.findByTestId('ember-canvas')

  act(() => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
  })

  expect(embers).toHaveAttribute('data-paused', 'true')
})

it('reports a failing canvas and keeps the glow', async () => {
  canvas.fail = true
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const onSceneError = vi.fn()

  renderBackground('scene', onSceneError)

  await act(() => Promise.resolve())
  expect(onSceneError).toHaveBeenCalled()
  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
  expect(screen.queryByTestId('ember-canvas')).toBeNull()
})

it('does not probe WebGL with reduced motion', () => {
  stubReducedMotion(true)
  stubWebGL(true)

  render(<App />)

  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled()
  expect(screen.queryByTestId('ember-canvas')).toBeNull()
})

it('renders only the glow without WebGL', () => {
  stubWebGL(false)

  render(<App />)

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
  render(<App />)
  await screen.findByTestId('ember-canvas')

  act(() => {
    matches = true
    onChange()
  })

  expect(screen.queryByTestId('ember-canvas')).toBeNull()
  expect(screen.getByTestId('background-glow')).toBeInTheDocument()
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

it('shows no stage illustration with the 3D scene', async () => {
  stubWebGL(true)

  render(<App />)

  await screen.findByTestId('ember-canvas')
  expect(document.querySelector('[data-stage-illustration]')).toBeNull()
})
