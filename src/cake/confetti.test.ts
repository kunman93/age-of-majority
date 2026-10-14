import { expect, it } from 'vitest'
import { CONFETTI_PALETTE, createConfetti } from './confetti'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

it('creates one entry per piece in every buffer', () => {
  const confetti = createConfetti(40, seededRandom(1))

  expect(confetti.velocities).toHaveLength(40 * 3)
  expect(confetti.colors).toHaveLength(40 * 3)
  expect(confetti.spins).toHaveLength(40)
  expect(confetti.delays).toHaveLength(40)
})

it('throws every piece upward', () => {
  const { velocities } = createConfetti(100, seededRandom(2))

  for (let i = 0; i < velocities.length; i += 3) {
    expect(velocities[i + 1]).toBeGreaterThan(0)
  }
})

it('colors every piece from the palette', () => {
  const { colors } = createConfetti(100, seededRandom(3))
  const palette = CONFETTI_PALETTE.map((color) => color.join(','))

  for (let i = 0; i < colors.length; i += 3) {
    const color = Array.from(colors.slice(i, i + 3)).map((c) => c.toFixed(4))
    expect(
      palette.map((p) => p.split(',').map((c) => Number(c).toFixed(4))),
    ).toContainEqual(color)
  }
})

it('is deterministic for a seeded random', () => {
  expect(createConfetti(20, seededRandom(4))).toEqual(
    createConfetti(20, seededRandom(4)),
  )
})
