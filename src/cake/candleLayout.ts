export const CANDLE_COUNT = 18

const OUTER = { count: 12, radius: 0.8 }
const INNER = { count: 6, radius: 0.4 }

/** x, z positions on the cake top, in the unit disc */
export function candleLayout() {
  return [OUTER, INNER].flatMap(({ count, radius }) =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius }
    }),
  )
}
