import { expect, it } from 'vitest'
import { dustSpecks } from './dust'

it('draws the same specks for the same seed and other specks for another', () => {
  expect(dustSpecks(30, 1)).toEqual(dustSpecks(30, 1))
  expect(dustSpecks(30, 1)).not.toEqual(dustSpecks(30, 2))
})

it('keeps every speck inside the field', () => {
  for (const { x, y, radius } of dustSpecks(60, 3)) {
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(200)
    expect(y).toBeGreaterThanOrEqual(0)
    expect(y).toBeLessThanOrEqual(300)
    expect(radius).toBeGreaterThan(0)
  }
})

it('thins out: the last specks are smaller and fainter than the first', () => {
  const specks = dustSpecks(60, 4)
  const first = specks.slice(0, 10)
  const last = specks.slice(-10)
  const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length

  expect(mean(last.map(({ radius }) => radius))).toBeLessThan(
    mean(first.map(({ radius }) => radius)),
  )
  expect(mean(last.map(({ opacity }) => opacity))).toBeLessThan(
    mean(first.map(({ opacity }) => opacity)),
  )
})
