import { expect, it } from 'vitest'
import { isInsideStage, STAGES, stageShapes } from './stageShapes'

it('has the three stages in story order', () => {
  expect(STAGES).toEqual(['17', '18', 'key'])
})

it('keeps every outline and hole inside the unit box', () => {
  for (const stage of STAGES) {
    for (const { outline, holes } of stageShapes[stage]) {
      for (const [x, y] of [outline, ...holes].flat()) {
        expect(Math.abs(x)).toBeLessThanOrEqual(1)
        expect(Math.abs(y)).toBeLessThanOrEqual(1)
      }
    }
  }
})

it.each([
  ['17', -0.7, 0.55],
  ['17', 0.5, 0.7],
  ['18', -0.45, 0],
  ['18', 0.52, 0.65],
  ['key', -0.8, 0],
  ['key', 0.3, 0],
] as const)('has solid ground inside %s at (%d, %d)', (stage, x, y) => {
  expect(isInsideStage(stage, x, y)).toBe(true)
})

it.each([
  ['17', 0, 0],
  ['18', 0.52, 0.4],
  ['18', 0.52, -0.4],
  ['key', -0.5, 0],
  ['key', 0, 0.8],
] as const)('has empty space in %s at (%d, %d)', (stage, x, y) => {
  expect(isInsideStage(stage, x, y)).toBe(false)
})
