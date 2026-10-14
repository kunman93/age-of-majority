/** Pointer movement (px) below which a press still counts as a tap */
export const TAP_THRESHOLD = 6
const RADIANS_PER_PIXEL = 0.01
// velocity is dropped when the pointer rests this long before release
const REST_MS = 80
// exponential velocity decay per second
const DAMPING = 5

export type Spin = {
  angle: number
  velocity: number
  dragging: boolean
}

export const createSpin = (): Spin => ({
  angle: 0,
  velocity: 0,
  dragging: false,
})

/** Advances the free-spinning inertia after release */
export function stepSpin(spin: Spin, delta: number) {
  if (spin.dragging) return
  spin.angle += spin.velocity * delta
  spin.velocity *= Math.exp(-DAMPING * delta)
  if (Math.abs(spin.velocity) < 0.001) spin.velocity = 0
}

/** Tracks one pointer gesture and tells a drag from a tap */
export function createDragTracker(spin: Spin) {
  let startX = 0
  let lastX = 0
  let lastTime = 0
  let pointerId: number | null = null
  let moved = false

  return {
    start(id: number, x: number, time: number) {
      pointerId = id
      startX = lastX = x
      lastTime = time
      moved = false
      spin.velocity = 0
    },
    move(id: number, x: number, time: number) {
      if (id !== pointerId) return false
      if (!moved && Math.abs(x - startX) < TAP_THRESHOLD) return false
      moved = true
      spin.dragging = true
      const angle = (x - lastX) * RADIANS_PER_PIXEL
      const seconds = Math.max((time - lastTime) / 1000, 0.008)
      spin.angle += angle
      spin.velocity = angle / seconds
      lastX = x
      lastTime = time
      return true
    },
    end(id: number, time: number) {
      if (id !== pointerId) return
      pointerId = null
      spin.dragging = false
      if (time - lastTime > REST_MS) spin.velocity = 0
    },
    /** True when the gesture was a drag, so the click after it is ignored */
    get wasDrag() {
      return moved
    },
    clear() {
      moved = false
    },
  }
}
