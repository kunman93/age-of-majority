import { expect, it } from 'vitest'
import { ornamentLayout, PLACEMENTS } from './ornamentLayout'

// the centered text and the story object live between these bands
const BAND = 14

it.each(PLACEMENTS)(
  'keeps every %s ornament in the top or bottom band, clear of the content',
  (placement) => {
    expect(ornamentLayout[placement].length).toBeGreaterThan(0)
    for (const { top } of ornamentLayout[placement]) {
      expect(top <= BAND || top >= 100 - BAND).toBe(true)
    }
  },
)

it.each(PLACEMENTS)(
  'mixes sparkles, stars and confetti in the %s',
  (placement) => {
    const kinds = new Set(ornamentLayout[placement].map(({ kind }) => kind))

    expect(kinds).toEqual(new Set(['sparkle', 'star', 'confetti']))
  },
)

it.each(PLACEMENTS)('keeps every %s ornament inside its layer', (placement) => {
  for (const { left, top, size } of ornamentLayout[placement]) {
    expect(left).toBeGreaterThanOrEqual(0)
    expect(left).toBeLessThanOrEqual(100)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThanOrEqual(100)
    expect(size).toBeGreaterThan(0)
  }
})
