export const EMBER_BOX = { width: 18, height: 14, nearZ: -4, farZ: 2 }

const SIZE_RANGE = [3, 9] as const
const SPEED_RANGE = [0.12, 0.35] as const

const between = (random: () => number, [min, max]: readonly [number, number]) =>
  min + random() * (max - min)

export function createEmbers(count: number, random: () => number) {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const speeds = new Float32Array(count)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * EMBER_BOX.width
    positions[i * 3 + 1] = random() * EMBER_BOX.height
    positions[i * 3 + 2] = between(random, [EMBER_BOX.nearZ, EMBER_BOX.farZ])
    sizes[i] = between(random, SIZE_RANGE)
    speeds[i] = between(random, SPEED_RANGE)
    phases[i] = random() * Math.PI * 2
  }

  return { positions, sizes, speeds, phases }
}
