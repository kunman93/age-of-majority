import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import CakeCanvas from './CakeCanvas'
import { createSpin } from './dragRotation'

const canvasProps = vi.hoisted(() => vi.fn())
const scene = vi.hoisted(() => vi.fn())
const inView = vi.hoisted(() => ({ value: true }))
const pageVisible = vi.hoisted(() => ({ value: true }))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: { children: ReactNode }) => {
    canvasProps(props)
    return <>{children}</>
  },
}))
vi.mock('./CakeScene', () => ({
  default: (props: unknown) => {
    scene(props)
    return null
  },
}))
vi.mock('./useInView', () => ({ useInView: () => inView.value }))
vi.mock('../background/usePageVisible', () => ({
  usePageVisible: () => pageVisible.value,
}))

beforeEach(() => {
  vi.clearAllMocks()
  inView.value = true
  pageVisible.value = true
})

const lastProps = () => canvasProps.mock.lastCall![0]

it('is a decorative wrapper that fills its frame and takes no pointer input', () => {
  const { container } = render(<CakeCanvas blown={false} spin={createSpin()} />)

  const wrapper = container.firstElementChild!
  expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  expect(wrapper.className).toContain('pointer-events-none')
  expect(wrapper.className).toContain('size-full')
  expect(lastProps().style).toEqual({ pointerEvents: 'none' })
})

it('is transparent, light on the GPU and at most 2 pixels per CSS pixel', () => {
  render(<CakeCanvas blown={false} spin={createSpin()} />)

  expect(lastProps().dpr).toEqual([1, 2])
  expect(lastProps().gl).toMatchObject({
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  })
})

it('renders continuously while in view on a visible page', () => {
  render(<CakeCanvas blown={false} spin={createSpin()} />)

  expect(lastProps().frameloop).toBe('always')
})

it('stops rendering when out of view', () => {
  inView.value = false

  render(<CakeCanvas blown={false} spin={createSpin()} />)

  expect(lastProps().frameloop).toBe('never')
})

it('stops rendering when the page is hidden', () => {
  pageVisible.value = false

  render(<CakeCanvas blown={false} spin={createSpin()} />)

  expect(lastProps().frameloop).toBe('never')
})

it('hands the blown state to the scene', () => {
  render(<CakeCanvas blown spin={createSpin()} />)

  expect(scene.mock.lastCall![0]).toMatchObject({ blown: true })
})
