import { expect, it } from 'vitest'
import { isInsideStage, STAGES } from '../story/stageShapes'
import {
  createEdgePoints,
  createStoryParticles,
  STORY_DEPTH,
} from './storyParticles'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

it('creates one buffer of count points for every stage', () => {
  const { positions } = createStoryParticles(50, seededRandom(1))

  expect(Object.keys(positions).sort()).toEqual([...STAGES].sort())
  for (const stage of STAGES) expect(positions[stage]).toHaveLength(50 * 3)
})

it.each(STAGES)('keeps every point inside the %s stage', (stage) => {
  const { positions } = createStoryParticles(200, seededRandom(2))

  const buffer = positions[stage]
  for (let i = 0; i < buffer.length; i += 3) {
    expect(isInsideStage(stage, buffer[i], buffer[i + 1])).toBe(true)
    expect(Math.abs(buffer[i + 2])).toBeLessThanOrEqual(STORY_DEPTH)
  }
})

it('gives every particle an offset between 0 and 1', () => {
  const { offsets } = createStoryParticles(100, seededRandom(3))

  expect(offsets).toHaveLength(100)
  offsets.forEach((offset) => {
    expect(offset).toBeGreaterThanOrEqual(0)
    expect(offset).toBeLessThan(1)
  })
})

it('is deterministic for a seeded random', () => {
  const first = createStoryParticles(30, seededRandom(4))
  const second = createStoryParticles(30, seededRandom(4))

  expect(second).toEqual(first)
})

it('creates count edge points as x, y pairs', () => {
  expect(createEdgePoints(50, seededRandom(4))).toHaveLength(50 * 2)
})

it('puts every edge point on the border of the -1..1 square', () => {
  const edge = createEdgePoints(400, seededRandom(5))

  for (let i = 0; i < edge.length; i += 2) {
    expect(Math.abs(edge[i]) === 1 || Math.abs(edge[i + 1]) === 1).toBe(true)
    expect(Math.abs(edge[i])).toBeLessThanOrEqual(1)
    expect(Math.abs(edge[i + 1])).toBeLessThanOrEqual(1)
  }
})

it('spreads the edge points over all four sides', () => {
  const edge = createEdgePoints(400, seededRandom(6))

  const sides = new Set<string>()
  for (let i = 0; i < edge.length; i += 2) {
    if (edge[i] === -1) sides.add('left')
    if (edge[i] === 1) sides.add('right')
    if (edge[i + 1] === -1) sides.add('bottom')
    if (edge[i + 1] === 1) sides.add('top')
  }
  expect([...sides].sort()).toEqual(['bottom', 'left', 'right', 'top'])
})

it('creates the same edge points for the same seed', () => {
  expect(createEdgePoints(30, seededRandom(7))).toEqual(
    createEdgePoints(30, seededRandom(7)),
  )
})
