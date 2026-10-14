import { describe, expect, it } from 'vitest'
import {
  createDragTracker,
  createSpin,
  stepSpin,
  TAP_THRESHOLD,
} from './dragRotation'

const POINTER = 1

describe('createDragTracker', () => {
  it('treats a press that stays below the threshold as a tap', () => {
    const spin = createSpin()
    const drag = createDragTracker(spin)
    drag.start(POINTER, 100, 0)

    expect(drag.move(POINTER, 100 + TAP_THRESHOLD - 1, 16)).toBe(false)
    drag.end(POINTER, 32)

    expect(drag.wasDrag).toBe(false)
    expect(spin.angle).toBe(0)
  })

  it('treats a press that reaches the threshold as a drag that turns the cake', () => {
    const spin = createSpin()
    const drag = createDragTracker(spin)
    drag.start(POINTER, 100, 0)

    expect(drag.move(POINTER, 100 + TAP_THRESHOLD, 16)).toBe(true)

    expect(drag.wasDrag).toBe(true)
    expect(spin.dragging).toBe(true)
    expect(spin.angle).toBeGreaterThan(0)
  })

  it('turns the cake the other way when dragging left', () => {
    const spin = createSpin()
    const drag = createDragTracker(spin)
    drag.start(POINTER, 100, 0)
    drag.move(POINTER, 100 - 3 * TAP_THRESHOLD, 16)

    expect(spin.angle).toBeLessThan(0)
  })

  it('ignores other pointers', () => {
    const spin = createSpin()
    const drag = createDragTracker(spin)
    drag.start(POINTER, 100, 0)

    expect(drag.move(2, 300, 16)).toBe(false)
    drag.end(2, 32)

    expect(drag.wasDrag).toBe(false)
    expect(spin.angle).toBe(0)
  })

  it('keeps the velocity when released while moving', () => {
    const spin = createSpin()
    const drag = createDragTracker(spin)
    drag.start(POINTER, 100, 0)
    drag.move(POINTER, 160, 16)
    drag.end(POINTER, 20)

    expect(spin.dragging).toBe(false)
    expect(spin.velocity).toBeGreaterThan(0)
  })

  it('drops the velocity when the pointer rested before release', () => {
    const spin = createSpin()
    const drag = createDragTracker(spin)
    drag.start(POINTER, 100, 0)
    drag.move(POINTER, 160, 16)
    drag.end(POINTER, 1000)

    expect(spin.velocity).toBe(0)
  })

  it('forgets the drag when cleared and when a new press starts', () => {
    const drag = createDragTracker(createSpin())
    drag.start(POINTER, 100, 0)
    drag.move(POINTER, 160, 16)
    drag.clear()
    expect(drag.wasDrag).toBe(false)

    drag.move(POINTER, 220, 32)
    drag.start(POINTER, 100, 100)
    expect(drag.wasDrag).toBe(false)
  })
})

describe('stepSpin', () => {
  it('keeps turning after release and slows down to a stop', () => {
    const spin = { angle: 0, velocity: 2, dragging: false }

    stepSpin(spin, 0.1)
    expect(spin.angle).toBeGreaterThan(0)
    const afterFirstStep = spin.velocity
    expect(afterFirstStep).toBeLessThan(2)

    for (let i = 0; i < 200; i += 1) stepSpin(spin, 0.1)
    expect(spin.velocity).toBe(0)
  })

  it('leaves the angle to the pointer while dragging', () => {
    const spin = { angle: 1, velocity: 2, dragging: true }

    stepSpin(spin, 0.1)

    expect(spin.angle).toBe(1)
    expect(spin.velocity).toBe(2)
  })
})
