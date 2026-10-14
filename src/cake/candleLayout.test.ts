import { expect, it } from 'vitest'
import { CANDLE_COUNT, candleLayout } from './candleLayout'

const MIN_GAP = 0.35

it('places 18 candles', () => {
  expect(CANDLE_COUNT).toBe(18)
  expect(candleLayout()).toHaveLength(CANDLE_COUNT)
})

it('keeps every candle inside the unit disc of the cake top', () => {
  for (const { x, z } of candleLayout()) {
    expect(Math.hypot(x, z)).toBeLessThanOrEqual(1)
  }
})

it('keeps the candles apart', () => {
  const candles = candleLayout()
  for (const [i, a] of candles.entries()) {
    for (const b of candles.slice(i + 1)) {
      expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(MIN_GAP)
    }
  }
})

it('is deterministic', () => {
  expect(candleLayout()).toEqual(candleLayout())
})
