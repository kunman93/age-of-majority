import { isInsideStage, STAGES, type Stage } from '../story/stageShapes'

export const STORY_DEPTH = 0.12

function sampleStage(stage: Stage, count: number, random: () => number) {
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    let x: number
    let y: number
    do {
      x = random() * 2 - 1
      y = random() * 2 - 1
    } while (!isInsideStage(stage, x, y))
    points[i * 3] = x
    points[i * 3 + 1] = y
    points[i * 3 + 2] = (random() * 2 - 1) * STORY_DEPTH
  }
  return points
}

export function createStoryParticles(count: number, random: () => number) {
  const positions = Object.fromEntries(
    STAGES.map((stage) => [stage, sampleStage(stage, count, random)]),
  ) as Record<Stage, Float32Array>
  const offsets = Float32Array.from({ length: count }, random)

  return { positions, offsets }
}

// x, y pairs on the border of the -1..1 square
export function createEdgePoints(count: number, random: () => number) {
  const points = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const side = Math.floor(random() * 4)
    const along = random() * 2 - 1
    const fixed = side % 2 === 0 ? -1 : 1
    points[i * 2] = side < 2 ? along : fixed
    points[i * 2 + 1] = side < 2 ? fixed : along
  }
  return points
}
