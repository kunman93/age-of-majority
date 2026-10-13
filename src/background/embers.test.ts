import { expect, it } from 'vitest'
import { createEmbers, EMBER_BOX } from './embers'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

it('creates one entry per ember in every attribute', () => {
  const embers = createEmbers(25, seededRandom(1))

  expect(embers.positions).toHaveLength(25 * 3)
  expect(embers.sizes).toHaveLength(25)
  expect(embers.speeds).toHaveLength(25)
  expect(embers.phases).toHaveLength(25)
})

it('keeps every ember inside the box', () => {
  const { positions } = createEmbers(200, seededRandom(2))

  for (let i = 0; i < positions.length; i += 3) {
    expect(Math.abs(positions[i])).toBeLessThanOrEqual(EMBER_BOX.width / 2)
    expect(positions[i + 1]).toBeGreaterThanOrEqual(0)
    expect(positions[i + 1]).toBeLessThanOrEqual(EMBER_BOX.height)
    expect(positions[i + 2]).toBeGreaterThanOrEqual(EMBER_BOX.nearZ - 1e-6)
    expect(positions[i + 2]).toBeLessThanOrEqual(EMBER_BOX.farZ + 1e-6)
  }
})

it('makes every ember rise, at a different pace', () => {
  const { speeds } = createEmbers(50, seededRandom(3))

  expect(Math.min(...speeds)).toBeGreaterThan(0)
  expect(new Set(speeds).size).toBeGreaterThan(1)
})

it('is deterministic for a given random source', () => {
  expect(createEmbers(30, seededRandom(4))).toEqual(
    createEmbers(30, seededRandom(4)),
  )
})
