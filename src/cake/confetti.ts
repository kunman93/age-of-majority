export const CONFETTI_DURATION = 3.5
export const FLAME_OUT_DURATION = 0.4

const MAX_DELAY = 0.3
const SPREAD = 1.5
const MIN_LIFT = 1.6
const LIFT_RANGE = 1.5

// the card's sun, tangerine, ember, blush and cream as linear 0..1 rgb
export const CONFETTI_PALETTE: [number, number, number][] = [
  [1, 0.82, 0.4],
  [1, 0.71, 0.39],
  [1, 0.42, 0.36],
  [0.96, 0.79, 0.66],
  [1, 0.96, 0.9],
]

export function createConfetti(count: number, random: () => number) {
  const velocities = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const spins = new Float32Array(count)
  const delays = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    velocities[i * 3] = (random() * 2 - 1) * SPREAD
    velocities[i * 3 + 1] = MIN_LIFT + random() * LIFT_RANGE
    velocities[i * 3 + 2] = (random() * 2 - 1) * SPREAD
    colors.set(
      CONFETTI_PALETTE[Math.floor(random() * CONFETTI_PALETTE.length)],
      i * 3,
    )
    spins[i] = (random() * 2 - 1) * 10
    delays[i] = random() * MAX_DELAY
  }

  return { velocities, colors, spins, delays }
}
