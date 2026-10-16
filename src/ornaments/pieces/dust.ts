export type Speck = { x: number; y: number; radius: number; opacity: number }

// small deterministic generator so a seed always draws the same field
const random = (seed: number) => {
  let state = seed * 2654435761 || 1
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/** Specks drift along a sweep from the lower left to the upper right of a 200 by 300 field, growing smaller and fainter and scattering wider as they go */
export function dustSpecks(count: number, seed: number): Speck[] {
  const next = random(seed)
  return Array.from({ length: count }, (_, index) => {
    const along = index / (count - 1)
    const scatter = 14 + along * 70
    const x = 14 + along * 170 + (next() - 0.5) * scatter
    const y = 286 - along * 270 + (next() - 0.5) * scatter
    return {
      x: Math.min(200, Math.max(0, x)),
      y: Math.min(300, Math.max(0, y)),
      radius: (0.9 + next() * 2) * (1.5 - along),
      opacity: (0.55 + next() * 0.4) * (1 - along * 0.75),
    }
  })
}
