import { expect, it } from 'vitest'
import { showcaseStage } from './showcaseStage'

it('holds each stage', () => {
  expect(showcaseStage(0)).toBe(0)
  expect(showcaseStage(0.2)).toBe(0)
  expect(showcaseStage(0.4)).toBeCloseTo(1)
  expect(showcaseStage(0.5)).toBeCloseTo(1)
  expect(showcaseStage(0.6)).toBeCloseTo(1)
  expect(showcaseStage(0.8)).toBeCloseTo(2)
  expect(showcaseStage(1)).toBe(2)
})

it('morphs between the held stages', () => {
  expect(showcaseStage(0.3)).toBeCloseTo(0.5)
  expect(showcaseStage(0.7)).toBeCloseTo(1.5)
})

it('clamps outside 0..1', () => {
  expect(showcaseStage(-1)).toBe(0)
  expect(showcaseStage(2)).toBe(2)
})
