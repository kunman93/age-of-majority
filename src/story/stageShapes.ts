export type Stage = '17' | '18' | 'key'
export type Point = readonly [number, number]
export type Shape = { outline: Point[]; holes: Point[][] }

export const STAGES: readonly Stage[] = ['17', '18', 'key']

const SEGMENTS = 40

const ellipse = (cx: number, cy: number, rx: number, ry: number): Point[] =>
  Array.from({ length: SEGMENTS }, (_, i) => {
    const angle = (i / SEGMENTS) * Math.PI * 2
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)] as const
  })

const rectangle = (x0: number, y0: number, x1: number, y1: number): Point[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
]

const ring = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  holeRx: number,
  holeRy: number,
): Shape => ({
  outline: ellipse(cx, cy, rx, ry),
  holes: [ellipse(cx, cy, holeRx, holeRy)],
})

const solid = (outline: Point[]): Shape => ({ outline, holes: [] })

const one = solid([
  [-0.35, -0.8],
  [-0.35, 0.8],
  [-0.52, 0.8],
  [-0.85, 0.5],
  [-0.85, 0.32],
  [-0.55, 0.52],
  [-0.55, -0.8],
])

const seven = solid([
  [0.1, 0.8],
  [0.95, 0.8],
  [0.95, 0.62],
  [0.62, -0.8],
  [0.4, -0.8],
  [0.72, 0.6],
  [0.1, 0.6],
])

const eight = [
  ring(0.52, 0.4, 0.38, 0.4, 0.17, 0.2),
  ring(0.52, -0.4, 0.43, 0.42, 0.22, 0.22),
]

export const stageShapes: Record<Stage, Shape[]> = {
  '17': [one, seven],
  '18': [one, ...eight],
  key: [
    ring(-0.5, 0, 0.42, 0.42, 0.2, 0.2),
    solid(rectangle(-0.1, -0.09, 0.95, 0.09)),
    solid(rectangle(0.6, -0.38, 0.72, -0.09)),
    solid(rectangle(0.82, -0.3, 0.94, -0.09)),
  ],
}

function isInsidePolygon(polygon: Point[], x: number, y: number) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function isInsideStage(stage: Stage, x: number, y: number) {
  return stageShapes[stage].some(
    ({ outline, holes }) =>
      isInsidePolygon(outline, x, y) &&
      !holes.some((hole) => isInsidePolygon(hole, x, y)),
  )
}
